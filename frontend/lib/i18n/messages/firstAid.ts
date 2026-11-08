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
  /** Scene card steps (pens `BIUma`/`E8Ofxp`): soap 15:00–14:00, rinse 14:00–00:00, antiseptic at 00:00. */
  steps: [
    {
      title: "Sabuni luka dan sekitarnya",
      window: "15:00 – 14:00",
      next: "Berikutnya: bilas di air mengalir, mulai 14:00.",
    },
    {
      title: "Bilas di bawah air mengalir",
      window: "14:00 – 00:00",
      next: "Berikutnya: antiseptik di 00:00, lalu Rabies Center.",
    },
    {
      title: "Oleskan antiseptik",
      window: "00:00",
      next: "Berikutnya: ke Rabies Center hari ini, meski luka kecil.",
    },
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
    {
      title: "Lather the wound and around it",
      window: "15:00 – 14:00",
      next: "Next: rinse under running water from 14:00.",
    },
    {
      title: "Rinse under running water",
      window: "14:00 – 00:00",
      next: "Next: antiseptic at 00:00, then a Rabies Center.",
    },
    {
      title: "Apply antiseptic",
      window: "00:00",
      next: "Next: go to a Rabies Center today, even if the wound is small.",
    },
  ],
}
