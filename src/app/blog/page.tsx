import localFont from "next/font/local";

const lastik = localFont({
  src: "../fonts/Lastik.woff2",
  display: "swap",
});

export default function Blog() {
  return (
    <main className="min-h-screen">
      {/* <div className="h-36" /> */}
      <div className="w-full h-[50vh] p-4 flex flex-col items-center justify-center bg-[linear-gradient(to_right,#FFFFFF20_1px,transparent_1px),linear-gradient(to_top,#FFFFFF20_1px,transparent_1px)] bg-[size:20px_20px] bg-[position:0_100%]">
        <h1
          className={`${lastik.className} text-8xl text-orange-100 tracking-tighter`}
        >
          Random stuff
        </h1>
        <p className="text-lg">(the blog)</p>
      </div>
    </main>
  );
}
