import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="rounded-2xl bg-zinc-950 px-8 py-16 text-center text-white">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Start mapping your clicks today.
        </h2>
        <p className="mt-4 text-zinc-400">
          Free forever for hobby projects. Pay only when you scale.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup">
            <Button size="lg">Start free</Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              I have an account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
