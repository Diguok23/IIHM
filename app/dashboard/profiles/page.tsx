"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { User, Mail, Calendar } from "lucide-react"

interface Profile {
  email: string
  full_name?: string
  created_at: string
}

export default function ProfilesPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!mounted || !user) return

        setProfile({
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "Not provided",
          created_at: user.created_at || "",
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      mounted = false
    }
  }, [])

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your personal account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Full Name</span>
            </label>
            <Input type="text" value={profile?.full_name || ""} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email Address</span>
            </label>
            <Input type="email" value={profile?.email || ""} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Member Since</span>
            </label>
            <Input
              type="text"
              value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ""}
              disabled
              className="bg-gray-50"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
