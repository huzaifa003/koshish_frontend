import Link from "next/link";
export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <h1 className="text-4xl font-bold">Let’s find your way back.</h1>
      <p className="my-6">
        This page could not be found. Explore a campaign or discover another way
        to help.
      </p>
      <Link className="underline" href="/">
        Return to Koshish →
      </Link>
    </main>
  );
}
