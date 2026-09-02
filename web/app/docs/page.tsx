import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/i18n/locales";

export default function DocsIndexPage() {
  redirect(`/docs/${DEFAULT_LOCALE}`);
}
