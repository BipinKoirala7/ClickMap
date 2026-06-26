import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section id="pricing" className="border-t border-border/70 py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="rounded-3xl bg-foreground p-12 text-background shadow-xl">
          <h2 className="font-display text-4xl font-bold tracking-tight">
            Start mapping your clicks today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-background/70">
            Free forever for hobby projects. Pay only when you scale.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/auth/register">Create free account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground"
            >
              <Link to="/auth/login">I have an account</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
