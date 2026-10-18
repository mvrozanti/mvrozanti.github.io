import type { GetStaticProps } from "next";
import Home from "./index";
import type { Props } from "./index";

export default function HomePt(props: Props) {
  return <Home {...props} initialLang="pt" />;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { loadProps } = await import("@/lib/props");
  return { props: { ...(await loadProps()), initialLang: "pt" } };
};
