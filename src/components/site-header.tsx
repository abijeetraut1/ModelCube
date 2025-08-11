import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {

  function prevPage() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <Button
          variant={"ghost"}
          onClick={prevPage}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Page</span>
        </Button>
        {/* <h1 className="text-base font-medium">Documents</h1> */}
        {/* <div className="ml-auto flex items-center gap-2">
          <Button onClick={() => {
            const slug = uuidv4();
            navigate("c/" + slug + "/code-space");
          }} variant="outline" size="sm" className="hidden sm:flex">
            Code Space
          </Button>
        </div> */}
      </div>
    </header>
  )
}
