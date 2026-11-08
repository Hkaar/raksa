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
  /** Scene captions (pens `BIUma`/`E8Ofxp`): soap 15:00–14:00, rinse 14:00–00:00, antiseptic at 00:00. */
  steps: ["Sabuni luka dan sekitarnya", "Bilas di bawah air mengalir", "Oleskan antiseptik"],
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
  steps: ["Lather the wound and around it", "Rinse under running water", "Apply antiseptic"],
}
