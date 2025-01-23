'use client';
import Image from "next/image";

export default function PageHome() {
  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Image src="/grafico.jpg" alt="Gráfico" width={500} height={500} className="rounded-full shadow-lg border-4 border-gray-300"/>
      </div>
    </>
  );
}
