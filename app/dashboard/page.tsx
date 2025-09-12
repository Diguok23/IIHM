"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen, BadgeIcon as Certificate, Clock, TrendingUp, User, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type {
  Database,
  EnrollmentWithCertification,
  ApplicationWithCertification,
  DashboardStats,
} from "@/lib/database.types"
import { Award } from "lucide-react" // Import Award icon

import { useCallback } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { AlertCircleIcon, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"

interface Enrollment {
  id: string
  certification_id: string
  status: "not_started" | "in_progress" | "completed"
  progress: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  due_date: string | null
  certificate_issued: boolean
  certificate_url: string | null
  certifications: {
    id: string // Added id to match the database type
    name: string
    description: string
    duration_days: number | null
    price: number
    category?: string
    level?: string
  }
  certificate_number?: string
}

interface UserProfile {
  id: number
  user_id: string
  full_name: string | null
  email: string | null
  is_admin: boolean | null
}

interface Certification {
  id: string
  name: string
  description: string
  duration_days: number | null
  price: number
}

interface Module {
  id: string
  name: string
  description: string | null
  order_index: number
  lessons: Lesson[]
  completed?: boolean // Added for client-side tracking
}

interface Lesson {
  id: string
  title: string
  content: string | null
  order_index: number
}

interface DashboardData {
  stats: DashboardStats
  enrollments: EnrollmentWithCertification[]
  applications: ApplicationWithCertification[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null) // State for user profile
  const [enrollmentsOld, setEnrollments] = useState<Enrollment[]>([])
  const [statsOld, setStats] = useState<DashboardStats>({
    activeEnrollments: 0,
    completedEnrollments: 0,
    totalProgress: 0,
    totalEnrollments: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificatesEarned: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEnrollmentForLearning, setSelectedEnrollmentForLearning] = useState<Enrollment | null>(null)
  const [selectedEnrollmentModules, setSelectedEnrollmentModules] = useState<Module[]>([])
  const [isUpdatingModule, setIsUpdatingModule] = useState(false)

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [allCertifications, setAllCertifications] = useState<Certification[]>([])
  const [isAssignCourseModalOpen, setIsAssignCourseModalOpen] = useState(false)
  const [selectedUserForAssignment, setSelectedUserForAssignment] = useState<string>("")
  const [selectedCertForAssignment, setSelectedCertForAssignment] = useState<string>("")
  const [assignmentDueDate, setAssignmentDueDate] = useState<Date | undefined>(undefined)
  const [isAssigningCourse, setIsAssigningCourse] = useState(false)

  // Admin Certifications/Modules/Lessons states
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [currentCert, setCurrentCert] = useState<Certification | null>(null)
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false)
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [selectedCertForModules, setSelectedCertForModules] = useState<string>("")
  const [modulesForSelectedCert, setModulesForSelectedCert] = useState<Module[]>([])
  const [isSavingContent, setIsSavingContent] = useState(false)

  const supabase = createClientComponentClient<Database>()
  const supabaseOld = createSupabaseClient()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw new Error(`Authentication error: ${userError.message}`)
        }

        if (!user) {
          throw new Error("No authenticated user found")
        }

        setUser(user)

        // Fetch enrollments with certification details
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("user_enrollments")
          .select(`
            id,
            certification_id,
            status,
            progress,
            enrolled_at,
            completed_at,
            certificate_issued,
            certificate_url,
            payment_status,
            certification:certifications (
              id,
              title,
              description,
              duration,
              level
            )
          `)
          .eq("user_id", user.id)
          .order("enrolled_at", { ascending: false })

        if (enrollmentsError) {
          console.error("Enrollments error:", enrollmentsError)
          throw new Error(`Failed to fetch enrollments: ${enrollmentsError.message}`)
        }

        // Fetch applications with certification details
        const { data: applications, error: applicationsError } = await supabase
          .from("applications")
          .select(`
            id,
            certification_id,
            full_name,
            email,
            status,
            created_at,
            certification:certifications (
              id,
              title,
              level
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (applicationsError) {
          console.error("Applications error:", applicationsError)
          throw new Error(`Failed to fetch applications: ${applicationsError.message}`)
        }

        // Calculate stats
        const stats: DashboardStats = {
          totalEnrollments: enrollments?.length || 0,
          activeEnrollments:
            enrollments?.filter((e) => e.status === "in_progress" || e.status === "enrolled").length || 0,
          completedCertifications: enrollments?.filter((e) => e.status === "completed").length || 0,
          pendingApplications: applications?.filter((a) => a.status === "pending").length || 0,
        }

        setData({
          stats,
          enrollments: enrollments || [],
          applications: applications || [],
        })
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  const fetchDashboardDataOld = useCallback(async () => {
    setIsLoading(true)
    try {
      const {
        data: { user: currentUser },
      } = await supabaseOld.auth.getUser()

      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)

      // Fetch user profile to check admin status and get full_name
      const { data: profileData, error: profileError } = await supabaseOld
        .from("user_profiles")
        .select("is_admin, full_name, email, user_id, id")
        .eq("user_id", currentUser.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching user profile:", profileError)
        setIsAdmin(false)
        setUserProfile(null)
      } else {
        setIsAdmin(profileData?.is_admin || false)
        setUserProfile(profileData || null)
      }

      // Fetch user's course enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabaseOld
        .from("user_enrollments")
        .select(`
          id,
          certification_id,
          progress,
          status,
          created_at,
          started_at,
          completed_at,
          due_date,
          certificate_issued,
          certificate_url,
          certificate_number,
          certifications:certification_id (
            id,
            name,
            description,
            duration_days,
            price
          )
        `)
        .eq("user_id", currentUser.id) // This line filters enrollments by the logged-in user's ID
        .order("created_at", { ascending: false })

      if (enrollmentsError) {
        console.error("Error fetching enrollments:", enrollmentsError)
      }
      setEnrollments(enrollmentsData || [])

      // Calculate stats
      const activeEnrollments = (enrollmentsData || []).filter(
        (enrollment) => enrollment.status === "in_progress",
      ).length
      const completedEnrollments = (enrollmentsData || []).filter(
        (enrollment) => enrollment.status === "completed",
      ).length
      const totalProgress =
        (enrollmentsData || []).length > 0
          ? Math.round(
              (enrollmentsData || []).reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0) /
                (enrollmentsData || []).length,
            )
          : 0

      setStats({
        activeEnrollments,
        completedEnrollments,
        totalProgress,
        totalEnrollments: enrollmentsData?.length || 0,
        completedCourses: (enrollmentsData || []).filter((e) => e.status === "completed").length || 0,
        inProgressCourses: (enrollmentsData || []).filter((e) => e.status === "in_progress").length || 0,
        certificatesEarned: (enrollmentsData || []).filter((e) => e.certificate_number).length || 0,
      })

      // Fetch data for admin sections if user is admin
      if (profileData?.is_admin) {
        const { data: usersData, error: usersError } = await supabaseOld
          .from("user_profiles")
          .select("id, user_id, full_name, email, is_admin")
          .order("full_name")

        if (usersError) console.error("Error fetching users:", usersError)
        setAllUsers(usersData || [])

        const { data: certsData, error: certsError } = await supabaseOld
          .from("certifications")
          .select("id, name, description, duration_days, price")
          .order("name")

        if (certsError) console.error("Error fetching certifications:", certsError)
        setAllCertifications(certsData || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [router, supabaseOld])

  useEffect(() => {
    fetchDashboardDataOld()
  }, [fetchDashboardDataOld])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
      case "active":
      case "in_progress":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "completed":
        return <Award className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircleIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      in_progress: "default",
      completed: "secondary",
      not_started: "outline",
    }

    const colors: Record<string, string> = {
      pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
      approved: "text-green-700 bg-green-50 border-green-200",
      rejected: "text-red-700 bg-red-50 border-red-200",
      in_progress: "text-blue-700 bg-blue-50 border-blue-200",
      completed: "text-purple-700 bg-purple-50 border-purple-200",
      not_started: "text-gray-700 bg-gray-50 border-gray-200",
    }

    return (
      <Badge variant={variants[status] || "outline"} className={`text-xs ${colors[status] || ""}`}>
        {status.replace(/_/g, " ").toUpperCase()}
      </Badge>
    )
  }

  const handleViewEnrollmentDetails = async (enrollment: Enrollment) => {
    setSelectedEnrollmentForLearning(enrollment)
    try {
      const { data: modulesData, error: modulesError } = await supabaseOld
        .from("modules")
        .select(`
          id,
          name,
          description,
          order_index,
          lessons (
            id,
            title,
            content,
            order_index
          )
        `)
        .eq("certification_id", enrollment.certification_id)
        .order("order_index")
        .order("order_index", { foreignTable: "lessons", ascending: true })

      if (modulesError) throw modulesError

      // Fetch user's completion status for each module
      const { data: userModulesData, error: userModulesError } = await supabaseOld
        .from("user_modules")
        .select("module_id, completed")
        .eq("user_id", user.id)
        .eq("user_enrollment_id", enrollment.id) // Link to user_enrollments.id

      if (userModulesError) throw userModulesError

      const userModuleCompletionMap = new Map(userModulesData?.map((um) => [um.module_id, um.completed]) || [])

      const formattedModules = modulesData.map((module) => ({
        id: module.id,
        name: module.name,
        description: module.description,
        order_index: module.order_index,
        completed: userModuleCompletionMap.get(module.id) || false,
        lessons: module.lessons || [],
      }))
      setSelectedEnrollmentModules(formattedModules)
    } catch (error) {
      console.error("Error fetching enrollment modules:", error)
      toast({
        title: "Error",
        description: "Failed to load enrollment modules.",
        variant: "destructive",
      })
    }
  }

  const toggleModuleCompletion = async (moduleId: string, currentStatus: boolean) => {
    setIsUpdatingModule(true)
    try {
      const {
        data: { session },
      } = await supabaseOld.auth.getSession()

      if (!session || !selectedEnrollmentForLearning) {
        router.push("/login")
        return
      }

      // Check if user_module record exists
      const { data: existingUserModule } = await supabaseOld
        .from("user_modules")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("user_enrollment_id", selectedEnrollmentForLearning.id)
        .eq("module_id", moduleId)
        .single()

      if (existingUserModule) {
        // Update existing record
        await supabaseOld
          .from("user_modules")
          .update({
            completed: !currentStatus,
          })
          .eq("id", existingUserModule.id)
      } else {
        // Insert new record (should ideally not happen if modules are pre-created on enrollment)
        await supabaseOld.from("user_modules").insert({
          user_id: session.user.id,
          user_enrollment_id: selectedEnrollmentForLearning.id,
          module_id: moduleId,
          completed: true,
        })
      }

      // Update local state for modules
      const updatedModules = selectedEnrollmentModules.map((module) =>
        module.id === moduleId ? { ...module, completed: !currentStatus } : module,
      )
      setSelectedEnrollmentModules(updatedModules)

      // Calculate new progress for the enrollment
      const completedModulesCount = updatedModules.filter((module) => module.completed).length
      const newProgress = Math.round((completedModulesCount / updatedModules.length) * 100)

      // Update enrollment progress in user_enrollments
      await supabaseOld
        .from("user_enrollments")
        .update({
          progress: newProgress,
          status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started",
          completed_at: newProgress === 100 ? new Date().toISOString() : null,
        })
        .eq("id", selectedEnrollmentForLearning.id)

      // Update local state for enrollments
      setEnrollments((prev) =>
        prev.map((enrollment) =>
          enrollment.id === selectedEnrollmentForLearning.id
            ? {
                ...enrollment,
                progress: newProgress,
                status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started",
              }
            : enrollment,
        ),
      )
      setSelectedEnrollmentForLearning((prev) =>
        prev
          ? {
              ...prev,
              progress: newProgress,
              status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started",
            }
          : null,
      )

      toast({
        title: currentStatus ? "Module marked as incomplete" : "Module completed",
        description: currentStatus ? "Your progress has been updated" : "Great job! Keep going!",
      })
    } catch (error) {
      console.error("Error updating module status:", error)
      toast({
        title: "Error",
        description: "Failed to update module status",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingModule(false)
    }
  }

  // Admin Functions
  const handleAssignCourse = async () => {
    setIsAssigningCourse(true)
    try {
      if (!selectedUserForAssignment || !selectedCertForAssignment) {
        toast({
          title: "Error",
          description: "Please select a user and a certification.",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabaseOld
        .from("user_enrollments")
        .insert({
          user_id: selectedUserForAssignment,
          certification_id: selectedCertForAssignment,
          status: "not_started",
          progress: 0,
          due_date: assignmentDueDate ? assignmentDueDate.toISOString() : null,
          created_at: new Date().toISOString(),
        })
        .select() // Add .select() to return the inserted data

      if (error) throw error

      // Automatically create user_modules entries for the new enrollment
      const { data: modules, error: modulesError } = await supabaseOld
        .from("modules")
        .select("id")
        .eq("certification_id", selectedCertForAssignment)

      if (modulesError) console.error("Error fetching modules for new enrollment:", modulesError)

      if (modules && modules.length > 0 && data && data.length > 0) {
        // Ensure data is not null/empty
        const userModulesToInsert = modules.map((module) => ({
          user_id: selectedUserForAssignment,
          user_enrollment_id: data[0].id, // Link to the newly created enrollment
          module_id: module.id,
          completed: false,
        }))
        const { error: userModulesInsertError } = await supabaseOld.from("user_modules").insert(userModulesToInsert)
        if (userModulesInsertError) console.error("Error inserting user modules:", userModulesInsertError)
      }

      toast({
        title: "Certification Assigned",
        description: "The certification has been successfully assigned to the user.",
      })
      setIsAssignCourseModalOpen(false)
      setSelectedUserForAssignment("")
      setSelectedCertForAssignment("")
      setAssignmentDueDate(undefined)
      fetchDashboardDataOld() // Refresh data
    } catch (error) {
      console.error("Error assigning certification:", error)
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the certification.",
        variant: "destructive",
      })
    } finally {
      setIsAssigningCourse(false)
    }
  }

  const handleEditCertification = (cert: Certification | null) => {
    setCurrentCert(cert)
    setIsCertModalOpen(true)
  }

  const handleSaveCertification = async () => {
    if (!currentCert) return

    setIsSavingContent(true)
    try {
      const { error } = await supabaseOld.from("certifications").upsert(currentCert).select()

      if (error) throw error

      toast({ title: "Certification Saved", description: "Certification details updated successfully." })
      setIsCertModalOpen(false)
      fetchDashboardDataOld() // Refresh data
    } catch (error) {
      console.error("Error saving certification:", error)
      toast({ title: "Error", description: "Failed to save certification.", variant: "destructive" })
    } finally {
      setIsSavingContent(false)
    }
  }

  const handleDeleteCertification = async (certId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this certification? This will also delete associated modules and lessons.",
      )
    )
      return

    try {
      // Delete associated modules and lessons first (due to foreign key constraints)
      // Fetch modules associated with this certification
      const { data: modulesToDelete, error: fetchModulesError } = await supabaseOld
        .from("modules")
        .select("id")
        .eq("certification_id", certId)

      if (fetchModulesError) throw fetchModulesError

      if (modulesToDelete && modulesToDelete.length > 0) {
        const moduleIds = modulesToDelete.map((m) => m.id)
        // Delete lessons associated with these modules
        const { error: deleteLessonsError } = await supabaseOld.from("lessons").delete().in("module_id", moduleIds)
        if (deleteLessonsError) throw deleteLessonsError

        // Delete user_modules associated with these modules
        const { error: deleteUserModulesError } = await supabaseOld
          .from("user_modules")
          .delete()
          .in("module_id", moduleIds)
        if (deleteUserModulesError) throw deleteUserModulesError

        // Delete the modules themselves
        const { error: deleteModulesError } = await supabaseOld.from("modules").delete().eq("certification_id", certId)
        if (deleteModulesError) throw deleteModulesError
      }

      // Finally, delete the certification
      const { error } = await supabaseOld.from("certifications").delete().eq("id", certId)

      if (error) throw error

      toast({ title: "Certification Deleted", description: "Certification and its content have been removed." })
      fetchDashboardDataOld() // Refresh data
    } catch (error) {
      console.error("Error deleting certification:", error)
      toast({ title: "Error", description: "Failed to delete certification.", variant: "destructive" })
    }
  }

  const handleEditModule = async (module: Module | null, certId: string) => {
    setCurrentModule(module)
    setSelectedCertForModules(certId)
    setIsModuleModalOpen(true)
  }

  const handleSaveModule = async () => {
    if (!currentModule || !selectedCertForModules) return

    setIsSavingContent(true)
    try {
      const moduleToSave = { ...currentModule, certification_id: selectedCertForModules }
      const { error } = await supabaseOld.from("modules").upsert(moduleToSave).select()

      if (error) throw error

      toast({ title: "Module Saved", description: "Module details updated successfully." })
      setIsModuleModalOpen(false)
      // Refresh modules for the selected cert if it's currently being viewed
      if (selectedCertForModules) {
        const { data: modulesData, error: modulesError } = await supabaseOld
          .from("modules")
          .select(`
            id,
            name,
            description,
            order_index,
            lessons (
              id,
              title,
              content,
              order_index
            )
          `)
          .eq("certification_id", selectedCertForModules)
          .order("order_index")
          .order("order_index", { foreignTable: "lessons", ascending: true })

        if (modulesError) console.error("Error fetching modules after save:", modulesError)
        setModulesForSelectedCert(modulesData || [])
      }
    } catch (error) {
      console.error("Error saving module:", error)
      toast({ title: "Error", description: "Failed to save module.", variant: "destructive" })
    } finally {
      setIsSavingContent(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module? This will also delete associated lessons.")) return

    try {
      // Delete associated lessons first
      const { error: deleteLessonsError } = await supabaseOld.from("lessons").delete().eq("module_id", moduleId)
      if (deleteLessonsError) throw deleteLessonsError

      // Delete user_modules associated with this module
      const { error: deleteUserModulesError } = await supabaseOld
        .from("user_modules")
        .delete()
        .eq("module_id", moduleId)
      if (deleteUserModulesError) throw deleteUserModulesError

      // Then delete the module itself
      const { error } = await supabaseOld.from("modules").delete().eq("id", moduleId)

      if (error) throw error

      toast({ title: "Module Deleted", description: "Module and its lessons have been removed." })
      // Refresh modules for the selected cert if it's currently being viewed
      if (selectedCertForModules) {
        const { data: modulesData, error: modulesError } = await supabaseOld
          .from("modules")
          .select(`
            id,
            name,
            description,
            order_index,
            lessons (
              id,
              title,
              content,
              order_index
            )
          `)
          .eq("certification_id", selectedCertForModules)
          .order("order_index")
          .order("order_index", { foreignTable: "lessons", ascending: true })

        if (modulesError) console.error("Error fetching modules after delete:", modulesError)
        setModulesForSelectedCert(modulesData || [])
      }
    } catch (error) {
      console.error("Error deleting module:", error)
      toast({ title: "Error", description: "Failed to delete module.", variant: "destructive" })
    }
  }

  const handleEditLesson = (lesson: Lesson | null, moduleId: string) => {
    setCurrentLesson(lesson)
    setCurrentModule((prev) => (prev ? { ...prev, id: moduleId } : null)) // Temporarily set module ID for context
    setIsLessonModalOpen(true)
  }

  const handleSaveLesson = async () => {
    if (!currentLesson || !currentModule?.id) return

    setIsSavingContent(true)
    try {
      const lessonToSave = { ...currentLesson, module_id: currentModule.id }
      const { error } = await supabaseOld.from("lessons").upsert(lessonToSave).select()

      if (error) throw error

      toast({ title: "Lesson Saved", description: "Lesson details updated successfully." })
      setIsLessonModalOpen(false)
      // Refresh modules for the selected cert if it's currently being viewed
      if (selectedCertForModules) {
        const { data: modulesData, error: modulesError } = await supabaseOld
          .from("modules")
          .select(`
            id,
            name,
            description,
            order_index,
            lessons (
              id,
              title,
              content,
              order_index
            )
          `)
          .eq("certification_id", selectedCertForModules)
          .order("order_index")
          .order("order_index", { foreignTable: "lessons", ascending: true })

        if (modulesError) console.error("Error fetching modules after save:", modulesError)
        setModulesForSelectedCert(modulesData || [])
      }
    } catch (error) {
      console.error("Error saving lesson:", error)
      toast({ title: "Error", description: "Failed to save lesson.", variant: "destructive" })
    } finally {
      setIsSavingContent(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    try {
      const { error } = await supabaseOld.from("lessons").delete().eq("id", lessonId)

      if (error) throw error

      toast({ title: "Lesson Deleted", description: "Lesson has been removed." })
      // Refresh modules for the selected cert if it's currently being viewed
      if (selectedCertForModules) {
        const { data: modulesData, error: modulesError } = await supabaseOld
          .from("modules")
          .select(`
            id,
            name,
            description,
            order_index,
            lessons (
              id,
              title,
              content,
              order_index
            )
          `)
          .eq("certification_id", selectedCertForModules)
          .order("order_index")
          .order("order_index", { foreignTable: "lessons", ascending: true })

        if (modulesError) console.error("Error fetching modules after delete:", modulesError)
        setModulesForSelectedCert(modulesData || [])
      }
    } catch (error) {
      console.error("Error deleting lesson:", error)
      toast({ title: "Error", description: "Failed to delete lesson.", variant: "destructive" })
    }
  }

  const handleIssueCertificate = async (enrollmentId: string, userId: string, certId: string) => {
    if (!confirm("Are you sure you want to issue a certificate for this enrollment?")) return

    try {
      // In a real application, you'd generate a unique certificate URL here
      // For now, we'll use a placeholder.
      const certificateUrl = `/certificates/${enrollmentId}.pdf` // Example URL

      const { error } = await supabaseOld
        .from("user_enrollments")
        .update({
          certificate_issued: true,
          certificate_url: certificateUrl,
        })
        .eq("id", enrollmentId)
        .eq("user_id", userId)
        .eq("certification_id", certId)

      if (error) throw error

      toast({ title: "Certificate Issued", description: "Certificate marked as issued and URL updated." })
      fetchDashboardDataOld() // Refresh data
    } catch (error) {
      console.error("Error issuing certificate:", error)
      toast({ title: "Error", description: "Failed to issue certificate.", variant: "destructive" })
    }
  }

  const getStatusColorOld = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "enrolled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted animate-pulse rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted animate-pulse rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No data available. Please try refreshing the page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "enrolled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email}` : ""}! Here's your learning progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">Courses you've enrolled in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.activeEnrollments}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Certificate className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.completedCertifications}</div>
            <p className="text-xs text-muted-foreground">Certifications earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Current Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle>Current Enrollments</CardTitle>
            <CardDescription>Your active courses and progress</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.enrollments?.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No enrollments yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start your learning journey by enrolling in a course.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/certifications">Browse Courses</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.enrollments?.slice(0, 3).map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {enrollment.certifications?.name || "Unknown Course"}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className={getStatusColor(enrollment.status)}>
                          {enrollment.status.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {enrollment.certifications?.duration_days || "Duration not specified"} days
                        </span>
                      </div>
                      <Progress value={enrollment.progress} className="w-full" />
                    </div>
                    <div className="text-sm text-muted-foreground">{enrollment.progress}%</div>
                  </div>
                ))}
                {data?.enrollments?.length > 3 && (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href="/dashboard/courses">View All Courses</a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your certification applications</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.applications?.length === 0 ? (
              <div className="text-center py-6">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No applications yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Apply for certification programs to get started.</p>
                <Button className="mt-4" asChild>
                  <a href="/apply">Apply Now</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.applications?.slice(0, 3).map((application) => (
                  <div key={application.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {application.certifications?.name || "Unknown Certification"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                ))}
                {data?.applications?.length > 3 && (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href="/dashboard/applications">View All Applications</a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
