import Footer from "@/components/footer"
import { Header } from "@/components/header"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col p-8 max-w-3xl mx-auto  min-h-screen">
      <Header />
      <main className="flex-1 ">{children}</main>
      <Footer />
    </div>
  )
}
