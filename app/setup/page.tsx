"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  BookOpen,
  Ship,
  Building,
  TrendingUp,
  Computer,
  Heart,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Zap,
  Download,
} from "lucide-react"

interface Certification {
  id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  slug: string
  created_at: string
}

interface Application {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  program_name: string
  program_category: string
  status: string
  created_at: string
}

export default function SetupPage() {
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [autoAddStatus, setAutoAddStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [setupMessage, setSetupMessage] = useState("")
  const [seedMessage, setSeedMessage] = useState("")
  const [autoAddMessage, setAutoAddMessage] = useState("")
  const [certificationCount, setCertificationCount] = useState(0)
  const [progress, setProgress] = useState(0)

  // Certifications management
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loadingCertifications, setLoadingCertifications] = useState(false)
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null)
  const [isAddingCertification, setIsAddingCertification] = useState(false)

  // Applications management
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  // Form state for certification
  const [certificationForm, setCertificationForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    price: 0,
    slug: "",
  })

  const categories = [
    "cruise",
    "executive",
    "business",
    "it",
    "healthcare",
    "sales",
    "training",
    "frontline",
    "social",
    "admin",
  ]

  const levels = ["Entry-Level", "Intermediate", "Advanced", "Executive", "All Levels"]

  // Additional certifications to auto-add
  const additionalCertifications = [
    // Advanced Hospitality Specializations (20 programs)
    {
      title: "Luxury Resort Management Excellence",
      description:
        "Master the art of managing ultra-luxury resorts with focus on personalized service, exclusive amenities, and high-net-worth guest expectations.",
      category: "executive",
      level: "Executive",
      price: 220,
      slug: "luxury-resort-management-excellence",
    },
    {
      title: "Boutique Hotel Operations Specialist",
      description:
        "Specialized training for managing boutique hotels with emphasis on unique character, personalized service, and local cultural integration.",
      category: "executive",
      level: "Advanced",
      price: 185,
      slug: "boutique-hotel-operations-specialist",
    },
    {
      title: "Resort Activities & Recreation Management",
      description:
        "Comprehensive training in planning, organizing, and managing recreational activities and entertainment programs at resort destinations.",
      category: "frontline",
      level: "Intermediate",
      price: 135,
      slug: "resort-activities-recreation-management",
    },
    {
      title: "Hotel Concierge Excellence Program",
      description:
        "Advanced concierge training covering luxury services, local expertise, VIP guest relations, and exclusive experience curation.",
      category: "frontline",
      level: "Advanced",
      price: 155,
      slug: "hotel-concierge-excellence-program",
    },
    {
      title: "Hospitality Sustainability Leadership",
      description:
        "Executive certification in sustainable hospitality practices, environmental stewardship, and green operations management.",
      category: "executive",
      level: "Executive",
      price: 195,
      slug: "hospitality-sustainability-leadership",
    },

    // Cruise Ship Advanced Specializations (15 programs)
    {
      title: "Cruise Ship Bridge Operations",
      description:
        "Advanced training for deck officers and bridge personnel in navigation, safety protocols, and maritime operations aboard cruise vessels.",
      category: "cruise",
      level: "Advanced",
      price: 210,
      slug: "cruise-ship-bridge-operations",
    },
    {
      title: "Maritime Hotel Services Management",
      description:
        "Specialized certification combining maritime regulations with hotel service excellence for cruise ship hospitality managers.",
      category: "cruise",
      level: "Advanced",
      price: 185,
      slug: "maritime-hotel-services-management",
    },
    {
      title: "Cruise Ship Culinary Excellence",
      description:
        "Advanced culinary certification for cruise ship chefs covering international cuisine, large-scale production, and maritime food safety.",
      category: "cruise",
      level: "Advanced",
      price: 175,
      slug: "cruise-ship-culinary-excellence",
    },
    {
      title: "Maritime Guest Experience Design",
      description:
        "Training in creating memorable guest experiences aboard cruise ships, including itinerary planning and onboard activity coordination.",
      category: "cruise",
      level: "Intermediate",
      price: 145,
      slug: "maritime-guest-experience-design",
    },
    {
      title: "Cruise Ship Environmental Officer",
      description:
        "Specialized certification for environmental compliance officers aboard cruise vessels, covering waste management and marine protection.",
      category: "cruise",
      level: "Advanced",
      price: 165,
      slug: "cruise-ship-environmental-officer",
    },

    // Digital Hospitality & Technology (12 programs)
    {
      title: "Hotel Technology Integration Specialist",
      description:
        "Advanced certification in hospitality technology systems, PMS integration, mobile solutions, and guest-facing technology.",
      category: "it",
      level: "Advanced",
      price: 190,
      slug: "hotel-technology-integration-specialist",
    },
    {
      title: "Hospitality Data Analytics Professional",
      description:
        "Comprehensive training in hospitality data analysis, revenue optimization, guest behavior analytics, and predictive modeling.",
      category: "it",
      level: "Advanced",
      price: 185,
      slug: "hospitality-data-analytics-professional",
    },
    {
      title: "Digital Guest Experience Manager",
      description:
        "Certification in managing digital touchpoints, mobile apps, online check-in systems, and digital concierge services.",
      category: "it",
      level: "Intermediate",
      price: 160,
      slug: "digital-guest-experience-manager",
    },
    {
      title: "Hospitality Cybersecurity Specialist",
      description:
        "Specialized training in protecting hospitality systems, guest data security, payment processing security, and cyber threat management.",
      category: "it",
      level: "Advanced",
      price: 195,
      slug: "hospitality-cybersecurity-specialist",
    },

    // Wellness & Spa Management (10 programs)
    {
      title: "Luxury Spa Management Certification",
      description:
        "Comprehensive training in managing high-end spa operations, wellness programs, and therapeutic service delivery.",
      category: "healthcare",
      level: "Advanced",
      price: 180,
      slug: "luxury-spa-management-certification",
    },
    {
      title: "Wellness Tourism Specialist",
      description:
        "Certification in developing and managing wellness tourism programs, retreat planning, and holistic guest experiences.",
      category: "healthcare",
      level: "Intermediate",
      price: 155,
      slug: "wellness-tourism-specialist",
    },
    {
      title: "Corporate Wellness Program Manager",
      description:
        "Training in designing and implementing wellness programs for hospitality employees and corporate clients.",
      category: "healthcare",
      level: "Intermediate",
      price: 145,
      slug: "corporate-wellness-program-manager",
    },

    // Event & Conference Management (8 programs)
    {
      title: "Luxury Event Planning & Execution",
      description:
        "Advanced certification in planning and executing high-end events, weddings, and corporate functions in hospitality settings.",
      category: "sales",
      level: "Advanced",
      price: 175,
      slug: "luxury-event-planning-execution",
    },
    {
      title: "Conference & Convention Management",
      description:
        "Specialized training in managing large-scale conferences, conventions, and business events in hotels and resorts.",
      category: "sales",
      level: "Advanced",
      price: 165,
      slug: "conference-convention-management",
    },
    {
      title: "Destination Wedding Specialist",
      description:
        "Certification in planning and coordinating destination weddings, including vendor management and cultural considerations.",
      category: "sales",
      level: "Intermediate",
      price: 150,
      slug: "destination-wedding-specialist",
    },

    // Food & Beverage Advanced (12 programs)
    {
      title: "Wine & Beverage Program Management",
      description:
        "Advanced certification in wine program development, sommelier services, and beverage cost control for hospitality operations.",
      category: "frontline",
      level: "Advanced",
      price: 165,
      slug: "wine-beverage-program-management",
    },
    {
      title: "Restaurant Concept Development",
      description:
        "Training in creating and launching new restaurant concepts within hotels and resorts, including menu development and branding.",
      category: "executive",
      level: "Advanced",
      price: 180,
      slug: "restaurant-concept-development",
    },
    {
      title: "Banquet & Catering Excellence",
      description:
        "Comprehensive certification in banquet operations, catering services, and large-scale food production management.",
      category: "frontline",
      level: "Intermediate",
      price: 140,
      slug: "banquet-catering-excellence",
    },
    {
      title: "Culinary Cost Control Specialist",
      description:
        "Advanced training in food cost management, inventory control, menu engineering, and kitchen profitability optimization.",
      category: "business",
      level: "Advanced",
      price: 155,
      slug: "culinary-cost-control-specialist",
    },

    // International Hospitality (10 programs)
    {
      title: "Cross-Cultural Hospitality Management",
      description:
        "Certification in managing diverse teams and serving international guests with cultural sensitivity and awareness.",
      category: "executive",
      level: "Advanced",
      price: 170,
      slug: "cross-cultural-hospitality-management",
    },
    {
      title: "International Hotel Development",
      description:
        "Advanced training in expanding hospitality brands internationally, including market analysis and cultural adaptation.",
      category: "executive",
      level: "Executive",
      price: 200,
      slug: "international-hotel-development",
    },
    {
      title: "Global Tourism Marketing",
      description:
        "Certification in marketing hospitality services to international markets, including digital marketing and cultural considerations.",
      category: "sales",
      level: "Advanced",
      price: 165,
      slug: "global-tourism-marketing",
    },

    // Specialized Service Areas (15 programs)
    {
      title: "Luxury Transportation Services",
      description:
        "Training in managing high-end transportation services, including limousine operations, private jet coordination, and VIP transfers.",
      category: "frontline",
      level: "Intermediate",
      price: 125,
      slug: "luxury-transportation-services",
    },
    {
      title: "Private Club Management",
      description:
        "Specialized certification in managing exclusive private clubs, member relations, and premium service delivery.",
      category: "executive",
      level: "Advanced",
      price: 185,
      slug: "private-club-management",
    },
    {
      title: "Golf & Country Club Operations",
      description:
        "Comprehensive training in golf course management, pro shop operations, and country club service excellence.",
      category: "executive",
      level: "Advanced",
      price: 175,
      slug: "golf-country-club-operations",
    },
    {
      title: "Marina & Yacht Club Management",
      description:
        "Specialized certification in managing marina operations, yacht services, and waterfront hospitality facilities.",
      category: "executive",
      level: "Advanced",
      price: 180,
      slug: "marina-yacht-club-management",
    },
    {
      title: "Casino & Gaming Operations",
      description:
        "Advanced training in casino management, gaming regulations, responsible gambling practices, and VIP player services.",
      category: "executive",
      level: "Advanced",
      price: 190,
      slug: "casino-gaming-operations",
    },

    // Emergency & Crisis Management (8 programs)
    {
      title: "Hospitality Crisis Communication",
      description:
        "Certification in crisis communication strategies, media relations, and reputation management during emergencies.",
      category: "executive",
      level: "Advanced",
      price: 160,
      slug: "hospitality-crisis-communication",
    },
    {
      title: "Emergency Response Coordinator",
      description:
        "Training in emergency preparedness, evacuation procedures, and crisis response coordination for hospitality facilities.",
      category: "admin",
      level: "Advanced",
      price: 155,
      slug: "emergency-response-coordinator",
    },
    {
      title: "Business Continuity Planning",
      description:
        "Advanced certification in developing and implementing business continuity plans for hospitality operations.",
      category: "executive",
      level: "Executive",
      price: 175,
      slug: "business-continuity-planning",
    },

    // Quality & Standards (6 programs)
    {
      title: "Hospitality Quality Assurance Manager",
      description:
        "Comprehensive training in quality management systems, service standards, and continuous improvement processes.",
      category: "admin",
      level: "Advanced",
      price: 165,
      slug: "hospitality-quality-assurance-manager",
    },
    {
      title: "Brand Standards Compliance Officer",
      description:
        "Certification in maintaining brand standards, conducting audits, and ensuring consistent service delivery across properties.",
      category: "admin",
      level: "Intermediate",
      price: 145,
      slug: "brand-standards-compliance-officer",
    },
    {
      title: "Guest Satisfaction Analytics",
      description:
        "Training in measuring and analyzing guest satisfaction, implementing feedback systems, and driving service improvements.",
      category: "business",
      level: "Intermediate",
      price: 140,
      slug: "guest-satisfaction-analytics",
    },
  ]

  const setupDatabase = async () => {
    setSetupStatus("loading")
    setSetupMessage("")
    setProgress(25)

    try {
      const response = await fetch("/api/setup-database")
      const data = await response.json()

      setProgress(100)

      if (data.success) {
        setSetupStatus("success")
        setSetupMessage(data.message)
      } else {
        setSetupStatus("error")
        setSetupMessage(data.error || "Failed to setup database")
      }
    } catch (error) {
      setSetupStatus("error")
      setSetupMessage("Network error occurred")
      console.error("Setup error:", error)
    }
  }

  const seedDatabase = async () => {
    setSeedStatus("loading")
    setSeedMessage("")
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/seed-certifications")
      const data = await response.json()

      clearInterval(progressInterval)
      setProgress(100)

      if (data.success) {
        setSeedStatus("success")
        setSeedMessage(data.message)
        setCertificationCount(data.count || 0)
        fetchCertifications() // Refresh certifications list
      } else {
        setSeedStatus("error")
        setSeedMessage(data.error || "Failed to seed database")
      }
    } catch (error) {
      setSeedStatus("error")
      setSeedMessage("Network error occurred")
      console.error("Seed error:", error)
    }
  }

  const autoAddCertifications = async () => {
    setAutoAddStatus("loading")
    setAutoAddMessage("")
    setProgress(0)

    try {
      let addedCount = 0
      const totalCerts = additionalCertifications.length

      for (let i = 0; i < additionalCertifications.length; i++) {
        const cert = additionalCertifications[i]

        const response = await fetch("/api/certifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cert),
        })

        if (response.ok) {
          addedCount++
        }

        // Update progress
        setProgress(Math.round(((i + 1) / totalCerts) * 100))

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      if (addedCount > 0) {
        setAutoAddStatus("success")
        setAutoAddMessage(`Successfully added ${addedCount} additional certifications!`)
        fetchCertifications() // Refresh the list
      } else {
        setAutoAddStatus("error")
        setAutoAddMessage("Failed to add certifications")
      }
    } catch (error) {
      setAutoAddStatus("error")
      setAutoAddMessage("Network error occurred while adding certifications")
      console.error("Auto-add error:", error)
    }
  }

  const fetchCertifications = async () => {
    setLoadingCertifications(true)
    try {
      const response = await fetch("/api/certifications")
      const data = await response.json()
      if (data.certifications) {
        setCertifications(data.certifications)
      }
    } catch (error) {
      console.error("Error fetching certifications:", error)
    } finally {
      setLoadingCertifications(false)
    }
  }

  const fetchApplications = async () => {
    setLoadingApplications(true)
    try {
      const response = await fetch("/api/applications")
      const data = await response.json()
      if (data.applications) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoadingApplications(false)
    }
  }

  const handleSaveCertification = async () => {
    try {
      const method = editingCertification ? "PUT" : "POST"
      const body = editingCertification ? { ...certificationForm, id: editingCertification.id } : certificationForm

      const response = await fetch("/api/certifications", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        fetchCertifications()
        setEditingCertification(null)
        setIsAddingCertification(false)
        setCertificationForm({
          title: "",
          description: "",
          category: "",
          level: "",
          price: 0,
          slug: "",
        })
      }
    } catch (error) {
      console.error("Error saving certification:", error)
    }
  }

  const handleDeleteCertification = async (id: string) => {
    if (confirm("Are you sure you want to delete this certification?")) {
      try {
        const response = await fetch(`/api/certifications?id=${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchCertifications()
        }
      } catch (error) {
        console.error("Error deleting certification:", error)
      }
    }
  }

  const handleUpdateApplicationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })

      if (response.ok) {
        fetchApplications()
      }
    } catch (error) {
      console.error("Error updating application:", error)
    }
  }

  const openEditDialog = (certification: Certification) => {
    setEditingCertification(certification)
    setCertificationForm({
      title: certification.title,
      description: certification.description,
      category: certification.category,
      level: certification.level,
      price: certification.price,
      slug: certification.slug,
    })
  }

  const openAddDialog = () => {
    setIsAddingCertification(true)
    setEditingCertification(null)
    setCertificationForm({
      title: "",
      description: "",
      category: "",
      level: "",
      price: 0,
      slug: "",
    })
  }

  useEffect(() => {
    fetchCertifications()
    fetchApplications()
  }, [])

  const certificationCategories = [
    { name: "Cruise & Maritime", count: 25, icon: Ship, color: "bg-blue-500" },
    { name: "Executive & Management", count: 20, icon: Building, color: "bg-purple-500" },
    { name: "Business & Finance", count: 15, icon: TrendingUp, color: "bg-green-500" },
    { name: "Information Technology", count: 15, icon: Computer, color: "bg-orange-500" },
    { name: "Healthcare & Wellness", count: 10, icon: Heart, color: "bg-red-500" },
    { name: "Sales & Marketing", count: 10, icon: TrendingUp, color: "bg-indigo-500" },
    { name: "Training & Instruction", count: 8, icon: BookOpen, color: "bg-yellow-500" },
    { name: "Frontline & Service", count: 12, icon: BookOpen, color: "bg-pink-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your database, certifications, and applications for the hospitality institute
          </p>
        </div>

        <Tabs defaultValue="setup" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Certifications
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Database Setup Card */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Database className="h-7 w-7" />
                    Step 1: Database Setup
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Ensure storage bucket is ready for document uploads.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button
                    onClick={setupDatabase}
                    disabled={setupStatus === "loading"}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    size="lg"
                  >
                    {setupStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Setting up...
                      </>
                    ) : setupStatus === "success" ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Setup Complete
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-5 w-5" />
                        Setup Storage
                      </>
                    )}
                  </Button>

                  {setupStatus === "loading" && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-gray-600 text-center">Setting up storage...</p>
                    </div>
                  )}

                  {setupMessage && (
                    <Alert
                      className={
                        setupStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      }
                    >
                      {setupStatus === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={setupStatus === "success" ? "text-green-800" : "text-red-800"}>
                        {setupMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Seed Data Card */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <BookOpen className="h-7 w-7" />
                    Step 2: Seed Certifications
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Add 130+ professional certifications to your database.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button
                    onClick={seedDatabase}
                    disabled={seedStatus === "loading"}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                    size="lg"
                  >
                    {seedStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Adding certifications...
                      </>
                    ) : seedStatus === "success" ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        {certificationCount} Added
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-5 w-5" />
                        Seed Certifications
                      </>
                    )}
                  </Button>

                  {seedStatus === "loading" && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-gray-600 text-center">Adding programs...</p>
                    </div>
                  )}

                  {seedMessage && (
                    <Alert
                      className={seedStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                    >
                      {seedStatus === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={seedStatus === "success" ? "text-green-800" : "text-red-800"}>
                        {seedMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Auto-Add Additional Certifications Card */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Zap className="h-7 w-7" />
                    Step 3: Add More Certifications
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Automatically add {additionalCertifications.length} additional specialized certifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">This will add:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Advanced Hospitality Specializations</li>
                      <li>• Cruise Ship Advanced Programs</li>
                      <li>• Digital Hospitality & Technology</li>
                      <li>• Wellness & Spa Management</li>
                      <li>• Event & Conference Management</li>
                      <li>• International Hospitality Programs</li>
                    </ul>
                  </div>

                  <Button
                    onClick={autoAddCertifications}
                    disabled={autoAddStatus === "loading"}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                    size="lg"
                  >
                    {autoAddStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Adding {additionalCertifications.length} certifications...
                      </>
                    ) : autoAddStatus === "success" ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        {additionalCertifications.length} Added
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Auto-Add {additionalCertifications.length} Certifications
                      </>
                    )}
                  </Button>

                  {autoAddStatus === "loading" && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-gray-600 text-center">Adding specialized programs...</p>
                    </div>
                  )}

                  {autoAddMessage && (
                    <Alert
                      className={
                        autoAddStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      }
                    >
                      {autoAddStatus === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={autoAddStatus === "success" ? "text-green-800" : "text-red-800"}>
                        {autoAddMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Categories Preview */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Certification Categories</CardTitle>
                <CardDescription className="text-indigo-100">
                  Professional development programs across multiple industries
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {certificationCategories.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">{category.name}</h4>
                        <p className="text-xs text-gray-600">{category.count}+ programs</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Manage Certifications</h2>
              <div className="flex gap-2">
                <Button onClick={fetchCertifications} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </div>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {loadingCertifications ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {certifications.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No certifications found. Start by seeding the database.</p>
                      </div>
                    ) : (
                      certifications.map((cert) => (
                        <div key={cert.id} className="border rounded-lg p-4 flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{cert.title}</h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{cert.description}</p>
                            <div className="flex gap-2 mb-2">
                              <Badge variant="secondary">{cert.category}</Badge>
                              <Badge variant="outline">{cert.level}</Badge>
                              <Badge variant="outline">${cert.price}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(cert)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteCertification(cert.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Application Management</h2>
              <Button onClick={fetchApplications} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {loadingApplications ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No applications received yet.</p>
                      </div>
                    ) : (
                      applications.map((app) => (
                        <div key={app.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {app.first_name} {app.last_name}
                              </h3>
                              <p className="text-gray-600">{app.email}</p>
                              <p className="text-sm text-gray-500">{app.program_name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  app.status === "approved"
                                    ? "default"
                                    : app.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {app.status}
                              </Badge>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Application Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Name</Label>
                                        <p>
                                          {app.first_name} {app.last_name}
                                        </p>
                                      </div>
                                      <div>
                                        <Label>Email</Label>
                                        <p>{app.email}</p>
                                      </div>
                                      <div>
                                        <Label>Phone</Label>
                                        <p>{app.phone}</p>
                                      </div>
                                      <div>
                                        <Label>Program</Label>
                                        <p>{app.program_name}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter className="gap-2">
                                    <Button
                                      onClick={() => handleUpdateApplicationStatus(app.id, "approved")}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => handleUpdateApplicationStatus(app.id, "rejected")}
                                      variant="destructive"
                                    >
                                      Reject
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Certifications</p>
                      <p className="text-2xl font-bold">{certifications.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold">{applications.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Applications</p>
                      <p className="text-2xl font-bold">
                        {applications.filter((app) => app.status === "pending").length}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Approved Applications</p>
                      <p className="text-2xl font-bold">
                        {applications.filter((app) => app.status === "approved").length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Certification Form Dialog */}
        <Dialog
          open={isAddingCertification || editingCertification !== null}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingCertification(false)
              setEditingCertification(null)
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCertification ? "Edit Certification" : "Add New Certification"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={certificationForm.title}
                  onChange={(e) => setCertificationForm({ ...certificationForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={certificationForm.description}
                  onChange={(e) => setCertificationForm({ ...certificationForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={certificationForm.category}
                    onValueChange={(value) => setCertificationForm({ ...certificationForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={certificationForm.level}
                    onValueChange={(value) => setCertificationForm({ ...certificationForm, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={certificationForm.price}
                    onChange={(e) => setCertificationForm({ ...certificationForm, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={certificationForm.slug}
                    onChange={(e) => setCertificationForm({ ...certificationForm, slug: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveCertification}>
                {editingCertification ? "Update" : "Create"} Certification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
