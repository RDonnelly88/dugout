import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

type Team = {
  id: string;
  name: string;
  created_at: string;
};

type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: "admin" | "viewer";
  created_at: string;
};

type TeamContextType = {
  currentTeam: Team | null;
  userTeams: Team[];
  userRole: "admin" | "viewer" | null;
  loading: boolean;
  createTeam: (name: string) => Promise<{ error: any | null }>;
  switchTeam: (teamId: string) => void;
  inviteToTeam: (teamId: string, email: string, role: "admin" | "viewer") => Promise<{ error: any | null }>;
  leaveTeam: (teamId: string) => Promise<{ error: any | null }>;
  updateTeam: (teamId: string, updates: { name: string }) => Promise<{ error: any | null }>;
  deleteTeam: (teamId: string) => Promise<{ error: any | null }>;
  isTeamAdmin: () => boolean;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [userRole, setUserRole] = useState<"admin" | "viewer" | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserTeams = async () => {
      if (!user) {
        setUserTeams([]);
        setCurrentTeam(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data: memberships, error: membershipError } = await supabase
          .from("team_members")
          .select("*, team:teams(*)")
          .eq("user_id", user.id);

        if (membershipError) throw membershipError;

        const teams = memberships.map((m: any) => ({
          id: m.team.id,
          name: m.team.name,
          created_at: m.team.created_at,
          role: m.role
        }));

        setUserTeams(teams.map(t => ({ id: t.id, name: t.name, created_at: t.created_at })));

        if (teams.length > 0 && !currentTeam) {
          const savedTeamId = localStorage.getItem("currentTeamId");
          const teamToSet = savedTeamId 
            ? teams.find(t => t.id === savedTeamId) || teams[0] 
            : teams[0];
          
          setCurrentTeam({
            id: teamToSet.id,
            name: teamToSet.name,
            created_at: teamToSet.created_at
          });
          
          setUserRole(teamToSet.role);
          localStorage.setItem("currentTeamId", teamToSet.id);
        } else if (teams.length === 0) {
          setCurrentTeam(null);
          setUserRole(null);
          localStorage.removeItem("currentTeamId");
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast({
          title: "Error fetching teams",
          description: "Could not load your teams. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeams();
  }, [user, toast]);

  useEffect(() => {
    const updateUserRole = async () => {
      if (!user || !currentTeam) return;

      try {
        const { data, error } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", currentTeam.id)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    updateUserRole();
  }, [currentTeam, user]);

  const createTeam = async (name: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert([{ 
          name, 
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from("team_members")
        .insert([{
          team_id: teamData.id,
          user_id: user.id,
          role: "admin",
          created_at: new Date().toISOString()
        }]);

      if (memberError) throw memberError;

      const newTeam = {
        id: teamData.id,
        name: teamData.name,
        created_at: teamData.created_at
      };

      setUserTeams([...userTeams, newTeam]);
      setCurrentTeam(newTeam);
      setUserRole("admin");
      localStorage.setItem("currentTeamId", newTeam.id);

      toast({
        title: "Team created",
        description: `You've successfully created the team "${name}".`,
      });

      return { error: null };
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error creating team",
        description: error.message || "Could not create the team. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const switchTeam = (teamId: string) => {
    const team = userTeams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
      localStorage.setItem("currentTeamId", team.id);
      
      const findRole = async () => {
        if (!user) return;
        
        try {
          const { data, error } = await supabase
            .from("team_members")
            .select("role")
            .eq("team_id", teamId)
            .eq("user_id", user.id)
            .single();

          if (error) throw error;
          setUserRole(data.role);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      };
      
      findRole();
      
      toast({
        title: "Team switched",
        description: `You are now working in "${team.name}".`,
      });
    }
  };

  const inviteToTeam = async (teamId: string, email: string, role: "admin" | "viewer") => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { data: roleCheck, error: roleError } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .single();

      if (roleError) throw roleError;
      if (roleCheck.role !== "admin") {
        return { error: "Only admins can invite members" };
      }

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", email)
        .single();

      if (userError) {
        return { error: "User not found" };
      }

      const { data: existingMember, error: memberCheckError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", userData.id);

      if (memberCheckError) throw memberCheckError;
      if (existingMember && existingMember.length > 0) {
        return { error: "User is already a team member" };
      }

      const { error: inviteError } = await supabase
        .from("team_members")
        .insert([{
          team_id: teamId,
          user_id: userData.id,
          role
        }]);

      if (inviteError) throw inviteError;

      toast({
        title: "Member invited",
        description: `Successfully invited ${email} to the team.`,
      });

      return { error: null };
    } catch (error) {
      console.error("Error inviting to team:", error);
      return { error };
    }
  };

  const leaveTeam = async (teamId: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", user.id);

      if (error) throw error;

      setUserTeams(userTeams.filter(t => t.id !== teamId));

      if (currentTeam && currentTeam.id === teamId) {
        if (userTeams.length > 1) {
          const nextTeam = userTeams.find(t => t.id !== teamId);
          if (nextTeam) {
            setCurrentTeam(nextTeam);
            localStorage.setItem("currentTeamId", nextTeam.id);
          }
        } else {
          setCurrentTeam(null);
          setUserRole(null);
          localStorage.removeItem("currentTeamId");
        }
      }

      toast({
        title: "Left team",
        description: "You've successfully left the team.",
      });

      return { error: null };
    } catch (error) {
      console.error("Error leaving team:", error);
      toast({
        title: "Error leaving team",
        description: "Could not leave the team. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateTeam = async (teamId: string, updates: { name: string }) => {
    try {
      const { error } = await supabase
        .from("teams")
        .update(updates)
        .eq("id", teamId);

      if (error) throw error;

      const updatedTeams = userTeams.map(team =>
        team.id === teamId ? { ...team, ...updates } : team
      );
      setUserTeams(updatedTeams);

      if (currentTeam && currentTeam.id === teamId) {
        setCurrentTeam({ ...currentTeam, ...updates });
      }

      toast({
        title: "Team updated",
        description: "Team information updated successfully.",
      });

      return { error: null };
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: "Error updating team",
        description: "Could not update the team. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;

      const updatedTeams = userTeams.filter(team => team.id !== teamId);
      setUserTeams(updatedTeams);

      if (currentTeam && currentTeam.id === teamId) {
        if (updatedTeams.length > 0) {
          setCurrentTeam(updatedTeams[0]);
          localStorage.setItem("currentTeamId", updatedTeams[0].id);
        } else {
          setCurrentTeam(null);
          setUserRole(null);
          localStorage.removeItem("currentTeamId");
        }
      }

      toast({
        title: "Team deleted",
        description: "Team has been successfully deleted.",
      });

      return { error: null };
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error deleting team",
        description: "Could not delete the team. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const isTeamAdmin = () => {
    return userRole === "admin";
  };

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        userTeams,
        userRole,
        loading,
        createTeam,
        switchTeam,
        inviteToTeam,
        leaveTeam,
        updateTeam,
        deleteTeam,
        isTeamAdmin,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
};
