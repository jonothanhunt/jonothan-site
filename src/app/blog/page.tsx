import localFont from "next/font/local";

const lastik = localFont({
  src: "../fonts/Lastik.woff2",
  display: "swap",
});

export default function Blog() {
  return (
    <main className="">
      <div className="h-36" />
      <div className="w-full p-4 flex flex-col items-center">
        <h1 className={`${lastik.className} text-8xl text-orange-100 tracking-tighter`}>
          Blog
        </h1>
        <p>where I write cool stuff.</p>
      </div>
    </main>
  );
}
