import Image from "next/image";
import Link from "next/link";

export function Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-around bg-white min-h-screen px-4 sm:px-8 md:px-16 lg:px-24 xl:px-36 py-8 lg:py-0">
      <div className="flex flex-col items-center justify-center bg-white w-full max-w-md mb-8 lg:mb-0">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-slate-900 tracking-tight text-center">
          Wright
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-4 mb-10 text-center text-sm sm:text-base">
          An insanely great* document editor.
        </p>
        {children}
        <p className="text-gray-600 opacity-50 dark:text-gray-400 mt-10 mb-10 text-center text-xs sm:text-sm">
          *unfinished
        </p>
      </div>
      <div className="flex flex-col items-center justify-center w-full lg:ml-10 lg:w-auto">
        <Image
          src="/wright-flyer.jpg"
          alt="Wright"
          width={700}
          height={700}
          className="rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none lg:w-[500px] xl:w-[700px] h-auto"
        />
        <Link
          href="https://en.wikipedia.org/wiki/File:First_flight2.jpg"
          className="text-gray-600 dark:text-gray-400 mt-2 opacity-50 hover:opacity-100 text-center text-2xs sm:text-xs"
        >
          John Daniels
        </Link>
      </div>
    </div>
  );
}
