import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { demo } from "@/lib/demo-data"

import { ResetDemoButton } from "./reset-demo-button"

type DemoLink = { href: string; label: string; node: string }

const warga: DemoLink[] = [
  { href: "/", label: "Splash", node: "GHNJE" },
  { href: "/beranda", label: "Beranda", node: "h7Hb2z" },
  { href: "/pertolongan-pertama", label: "Pertolongan pertama (cuci luka 15 menit)", node: "BIUma · E8Ofxp" },
  { href: "/lapor", label: "Lapor dengan suara", node: "B7QRK" },
  { href: "/lapor/pertanyaan/1", label: "Pertanyaan lanjutan 1/4", node: "NpAQ3" },
  { href: "/lapor/formulir", label: "Formulir singkat", node: "kbpfq · DHGIR" },
  { href: "/lapor/scan", label: "Rekam luka", node: "E1WsTe" },
  { href: "/lapor/scan/analisis", label: "Analisis video", node: "q45po" },
  { href: "/lapor/scan/hasil", label: "Hasil periksa luka", node: "H3lkO" },
  { href: "/lapor/konfirmasi", label: "Konfirmasi ringkasan", node: "a6OIN" },
  { href: "/lapor/kartu-vaksin", label: "Foto kartu vaksin", node: "Y3eAG" },
  { href: "/lapor/kartu-vaksin/hasil", label: "Hasil kartu vaksin", node: "cnrdA" },
  { href: "/kasus/A7F3/hasil", label: "Hasil — HARI INI", node: "ZRxtB · KBklW · Y0BFDe" },
  { href: "/kasus/F6Q2", label: "Status kasus — observasi berjalan", node: "IWpFX" },
  { href: "/kasus/A7F3/kartu", label: "Kartu laporan", node: "hDj7e" },
]

const keadaan: DemoLink[] = [
  { href: "/lapor?mode=ketik", label: "Lapor dengan mengetik", node: "b8zgHY" },
  { href: "/lapor?keadaan=mikrofon-ditolak", label: "Mikrofon ditolak", node: "b8zgHY" },
  { href: "/lapor/formulir?keadaan=tanpa-ai", label: "AI tidak tersedia → formulir", node: "kbpfq" },
  { href: "/lapor/bukan-gigitan", label: "Bukan gigitan", node: "tAXvr" },
  { href: "/lapor/kartu-vaksin?keadaan=buram", label: "Foto kartu vaksin buram", node: "kDuvX" },
  { href: "/lapor/kartu-vaksin/hasil?manual=1", label: "Isi kartu vaksin manual", node: "cnrdA" },
  { href: "/kasus/C2D9/hasil", label: "Hasil — DALAM 24 JAM", node: "WMz1K" },
  { href: "/kasus/A7F3/hasil?keadaan=gagal-simpan", label: "Kasus gagal tersimpan online", node: "p8GJVp" },
  { href: "/kasus/B21K", label: "Status kasus — hewan sakit", node: "f9Nnc" },
  { href: "/kasus/A7F3", label: "Status kasus — observasi belum dimulai", node: "IWpFX" },
  { href: "/rabies-center", label: "Lokasi tidak diizinkan → pilih kecamatan", node: "bfM2c" },
]

const petugas: DemoLink[] = [
  { href: "/petugas/masuk", label: "Masuk petugas", node: "UTLPY" },
  { href: "/petugas/antrean", label: "Antrean kasus", node: "xt6J3 · nDvwd" },
  { href: "/petugas/kasus/A7F3", label: "Detail kasus — observasi belum dimulai", node: "rRqjA" },
  { href: "/petugas/kasus/F6Q2", label: "Detail kasus — observasi berjalan", node: "txgHS" },
]

const ownerCodes = ["D90P", "B21K", "F6Q2"]
const pemilik: DemoLink[] = [
  ...ownerCodes.map((code) => {
    const c = demo.cases.find((item) => item.code === code)!
    return { href: `/h/${c.ownerToken}`, label: `Laporan hewan kasus #${code}`, node: "lLhrW · QbiOQ · V2o86E" }
  }),
  {
    href: `/h/${demo.cases.find((c) => c.code === "A7F3")!.ownerToken}`,
    label: "Laporan hewan kasus #A7F3 — aktif setelah petugas memulai observasi",
    node: "lLhrW",
  },
]

function Section({
  title,
  links,
  note,
  action,
}: {
  title: string
  links: DemoLink[]
  note?: string
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[22px] leading-7 font-medium">{title}</CardTitle>
        {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
        {action}
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col">
          {links.map((link) => (
            <li key={link.href} className="flex flex-wrap items-center justify-between gap-x-3">
              <Button asChild variant="link" size="sm" className="px-0">
                <Link href={link.href}>{link.label}</Link>
              </Button>
              <span className="text-xs text-muted-foreground">
                {link.href} · {link.node}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function DemoPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-[32px] leading-10 font-medium">Indeks demo RAKSA</h1>
        <p className="text-muted-foreground">Semua layar dan keadaan dari desain. Data dari data/demo.json.</p>
      </header>
      <Section title="Warga" links={warga} />
      <Section title="Keadaan" links={keadaan} />
      <Section
        title="Petugas"
        links={petugas}
        note={`Masuk memakai akun petugas di backend (Supabase) atau tombol "Masuk sebagai demo" bila shortcut diaktifkan. "Muat data contoh" menghapus observasi dan laporan pemilik yang dibuat di browser ini.`}
        action={<ResetDemoButton />}
      />
      <Section title="Pemilik hewan" links={pemilik} />
    </main>
  )
}
