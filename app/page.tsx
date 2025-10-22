import { redirect } from "next/navigation"

export default function Home() {
  // In production, check user authentication and role
  redirect("/admin")
}
