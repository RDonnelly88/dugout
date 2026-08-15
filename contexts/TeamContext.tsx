"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Team, TeamMember, TeamRole } from "@/types/team";

type TeamContextType = {
  currentTeam: Team | null;
  userTeams: Team[];
  userRole: TeamRole | null;
  loading: boolean;
  createTeam: (name: string) => Promise<{ error: any | null }>;
  switchTeam: (teamId: string) => void;
  inviteToTeam: (teamId: string, email: string, role: TeamRole) => Promise<{ error: any | null }>;
  joinTeamById: (teamId: string) => Promise<{ error: any | null, success: boolean }>;
  leaveTeam: (teamId: string) => Promise<{ error: any | null }>;
  updateTeam: (teamId: string, updates: { name: string }) => Promise<{ error: any | null }>;
  deleteTeam: (teamId: string) => Promise<{ error: any | null }>;
  isTeamAdmin: () => boolean;
  updateMemberRole: (memberId: string, newRole: TeamRole) => Promise<{ error: any | null }>;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [userRole, setUserRole] = useState<TeamRole | null>(null);
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
    // Keyed on the id, not the object. Only `user.id` is read in here, and an
    // auth event hands back a fresh `User` every time — depending on the
    // reference would refetch every team on each token refresh.
  }, [user?.id, toast]);

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
  }, [currentTeam?.id, user?.id]);

  const ensureProfileExists = async () => {
    if (!user) return { error: "Not authenticated" };
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      
      if (error && error.code === "PGRST116") {
        console.log("Creating new profile for user", user.id);
        const { error: createError } = await supabase
          .from("profiles")
          .insert([{ 
            id: user.id,
            username: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (createError) {
          console.error("Error creating profile:", createError);
          return { error: createError };
        }
      } else if (error) {
        console.error("Error checking profile:", error);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error("Exception in ensureProfileExists:", error);
      return { error };
    }
  };

  const createTeam = async (name: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create a team",
        variant: "destructive",
      });
      return { error: "Not authenticated" };
    }

    try {
      const { error: profileError } = await ensureProfileExists();
      if (profileError) {
        toast({
          title: "Error with user profile",
          description: "Could not verify or create your user profile",
          variant: "destructive",
        });
        return { error: profileError };
      }
      
      // No owner argument: the function reads auth.uid() itself, so a caller
      // cannot create a team belonging to somebody else.
      const { data, error } = await supabase.rpc('create_team_with_admin', {
        team_name: name
      });

      if (error) {
        console.error("Team creation error:", error);
        toast({
          title: "Team creation failed",
          description: error.message || "There was an error creating your team",
          variant: "destructive",
        });
        return { error };
      }

      if (!data) {
        const noDataError = new Error("No data returned from create_team_with_admin");
        console.error("Team creation error:", noDataError);
        toast({
          title: "Team creation failed",
          description: "Team creation procedure did not return expected data",
          variant: "destructive",
        });
        return { error: noDataError };
      }

      console.log("Team created successfully:", data);

      const teamId = typeof data === 'object' && data !== null && 'team_id' in data 
        ? (data as { team_id: string }).team_id 
        : null;
        
      if (!teamId) {
        const noTeamIdError = new Error("No team_id in response data");
        console.error("Team creation error:", noTeamIdError);
        toast({
          title: "Team creation failed",
          description: "Team creation response did not include team ID",
          variant: "destructive",
        });
        return { error: noTeamIdError };
      }

      const { data: teamData, error: teamFetchError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();
        
      if (teamFetchError) {
        console.error("Failed to fetch new team details:", teamFetchError);
        toast({
          title: "Team created but details not loaded",
          description: "Try refreshing the page to see your new team",
        });
        return { error: null }; // Team was created but details not loaded
      }

      const newTeam: Team = {
        id: teamData.id,
        name: teamData.name,
        created_at: teamData.created_at
      };

      setUserTeams(prevTeams => [...prevTeams, newTeam]);
      setCurrentTeam(newTeam);
      setUserRole("admin");
      localStorage.setItem("currentTeamId", newTeam.id);

      toast({
        title: "Team created",
        description: `You've successfully created the team "${name}".`,
      });

      return { error: null };
    } catch (error: any) {
      console.error("Team creation exception:", error);
      toast({
        title: "Team creation failed",
        description: error.message || "An unexpected error occurred. Please try again.",
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

      if (roleError) {
        console.error("Error checking user role:", roleError);
        return { error: roleError };
      }
      
      if (roleCheck.role !== "admin") {
        return { error: "Only admins can invite members" };
      }

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", email);

      if (userError) {
        console.error("Error finding user by email:", userError);
        return { error: userError };
      }

      if (!userData || userData.length === 0) {
        return { error: "User not found with this email" };
      }

      const targetUserId = userData[0].id;

      const { data: existingMember, error: memberCheckError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", targetUserId);

      if (memberCheckError) {
        console.error("Error checking existing membership:", memberCheckError);
        return { error: memberCheckError };
      }
      
      if (existingMember && existingMember.length > 0) {
        return { error: "User is already a team member" };
      }

      const { error: inviteError } = await supabase
        .from("team_members")
        .insert([{
          team_id: teamId,
          user_id: targetUserId,
          role
        }]);

      if (inviteError) {
        console.error("Error adding team member:", inviteError);
        return { error: inviteError };
      }

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

  const joinTeamById = async (teamId: string) => {
    if (!user) return { error: "Not authenticated", success: false };

    try {
      console.log("Joining team with ID:", teamId);
      
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("id, name")
        .eq("id", teamId);

      if (teamError) {
        console.error("Error finding team:", teamError);
        return { error: teamError, success: false };
      }

      if (!teamData || teamData.length === 0) {
        console.error("Team not found with ID:", teamId);
        return { error: { message: "Team not found" }, success: false };
      }

      const { data: existingMember, error: memberCheckError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", user.id);

      if (memberCheckError) {
        console.error("Error checking existing membership:", memberCheckError);
        return { error: memberCheckError, success: false };
      }
      
      if (existingMember && existingMember.length > 0) {
        console.log("User is already a member of this team");
        return { error: { message: "You are already a member of this team" }, success: false };
      }

      const { error: profileError } = await ensureProfileExists();
      if (profileError) {
        console.error("Error ensuring profile exists:", profileError);
        return { error: { message: "Unable to verify user profile. Please try again." }, success: false };
      }

      const { error: joinError } = await supabase
        .from("team_members")
        .insert([{
          team_id: teamId,
          user_id: user.id,
          role: "viewer"
        }]);

      if (joinError) {
        console.error("Error joining team:", joinError);
        return { error: joinError, success: false };
      }

      const newTeam = {
        id: teamData[0].id,
        name: teamData[0].name,
        created_at: new Date().toISOString()
      };

      console.log("Successfully joined team:", newTeam);

      setUserTeams(prevTeams => [...prevTeams, newTeam]);
      setCurrentTeam(newTeam);
      setUserRole("viewer");
      localStorage.setItem("currentTeamId", newTeam.id);

      toast({
        title: "Team joined",
        description: `You have successfully joined the team "${teamData[0].name}".`,
      });

      return { error: null, success: true };
    } catch (error) {
      console.error("Error joining team:", error);
      toast({
        title: "Error joining team",
        description: "Could not join the team. Please try again.",
        variant: "destructive",
      });
      return { error, success: false };
    }
  };

  const updateMemberRole = async (memberId: string, newRole: TeamRole) => {
    if (!user || !currentTeam) return { error: "Not authenticated or no team selected" };

    try {
      if (userRole !== "admin") {
        return { error: "Only admins can update member roles" };
      }

      const { error } = await supabase
        .from("team_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: `Team member's role has been updated to ${newRole}.`,
      });

      return { error: null };
    } catch (error) {
      console.error("Error updating member role:", error);
      toast({
        title: "Error updating role",
        description: "Could not update the member's role. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
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
        joinTeamById,
        leaveTeam,
        updateTeam,
        deleteTeam,
        isTeamAdmin,
        updateMemberRole,
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
