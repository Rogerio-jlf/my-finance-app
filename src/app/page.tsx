'use client';
import Image from "next/image";

export default function PageHome() {
  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <Image src="/grafico.jpg" alt="Gráfico" width={500} height={500} className="rounded-full shadow-lg"/>
      </div>
    </>
  );
}
