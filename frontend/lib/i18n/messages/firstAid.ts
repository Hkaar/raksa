export const firstAidId = {
  timeSub: "menit",
  idle: {
    headline: "Cuci luka sekarang",
    cta: "Mulai hitung 15 menit",
    skip: "Sudah dicuci? Lanjut lapor",
  },
  running: {
    headline: "Bagus, terus bilas",
    pause: "Jeda",
    resume: "Lanjutkan",
    skip: "Selesai lebih awal? Lanjut lapor",
  },
  done: {
    headline: "15 menit selesai",
    cta: "Lanjut lapor",
    toast: "15 menit selesai. Lanjut lapor.",
  },
  steps: [
    { title: "Sabun + air mengalir", sub: "Bilas seluruh luka selama 15 menit." },
    { title: "Lalu ke Rabies Center", sub: "Hari ini juga, meski luka kecil." },
  ],
}

export const firstAidEn: typeof firstAidId = {
  timeSub: "minutes",
  idle: {
    headline: "Wash the wound now",
    cta: "Start 15-minute timer",
    skip: "Already washed? Continue to report",
  },
  running: {
    headline: "Good, keep rinsing",
    pause: "Pause",
    resume: "Resume",
    skip: "Finished early? Continue to report",
  },
  done: {
    headline: "15 minutes done",
    cta: "Continue to report",
    toast: "15 minutes done. Continue to report.",
  },
  steps: [
    { title: "Soap + running water", sub: "Rinse the whole wound for 15 minutes." },
    { title: "Then go to a Rabies Center", sub: "Today, even if the wound is small." },
  ],
}
