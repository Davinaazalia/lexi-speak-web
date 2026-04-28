"use client";

import { ArrowLeft } from "phosphor-react";
import IconButton from "./IconButton";


type Props = {
  title: string
}

export function SectionNav({ title }: Props) {
  return (
    <div className="inline-flex justify-start items-center gap-6">
      <IconButton variant="base" icon={ArrowLeft} />
      <h2 className="text-center text-black text-lg font-bold">
        {title}
      </h2>
    </div>
  )
}