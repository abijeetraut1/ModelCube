import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { fetchTitle } from "@/lib/Database/ChatsDB";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function SiteHeader() {
  const slug = useSelector(state => state.workflow.slug);
  const [title, setTitle] = useState('New Chat');

  useEffect(() => {
    console.log(slug);
    (async () => {

      if(!slug) return; 
      const chatTitle = await fetchTitle(slug);
      console.log(chatTitle);
      setTitle(chatTitle ? chatTitle : 'New Chat');
    })();
  }, [slug]);


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
          <span>{title}</span>
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
