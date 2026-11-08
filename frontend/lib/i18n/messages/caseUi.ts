/** Shared case/result components: UrgencyCard, NextSteps, DeadlineMeter, ObservationTimeline, map, center rows, report card. */
export const caseUiId = {
  urgencyCard: {
    todaySubtitle: "Segera ke Rabies Center atau Puskesmas hari ini.",
    reasonsPrefix: "Karena: ",
    reasonSeparator: " · ",
    within24Subtitle: "Datangi faskes paling lambat {date} pukul {time}.",
    within24Required: "Tetap datang ke faskes. Hanya tenaga kesehatan yang bisa menilai luka ini.",
    findRabiesCenter: "Cari Rabies Center terdekat",
  },
  nextSteps: {
    title: "Langkah berikutnya",
    steps: [
      { title: "Cuci luka sekarang", desc: "Sabun dan air mengalir, 15 menit." },
      { title: "Ke Rabies Center hari ini", desc: "Tunjukkan kartu laporan atau kode QR." },
      { title: "Ikuti keputusan petugas", desc: "Vaksin diberikan sesuai penilaian tenaga kesehatan." },
      { title: "Pantau kabar hewan", desc: "Status hewan diperbarui di halaman kasus." },
    ],
  },
  deadlineMeter: {
    remaining: "Sisa waktu",
    limit: "Batas 24 jam",
    bitten: "Digigit",
    deadline: "Batas",
  },
  observationTimeline: {
    day: "Hari {n}",
    label: "Hari ke-{day} dari {total}",
  },
  map: {
    label: "Peta Rabies Center terdekat",
    yourLocation: "Lokasi Anda",
    marker: "Rabies Center {n}",
    hours: "Buka {hours}",
    zoomIn: "Perbesar peta",
    zoomOut: "Perkecil peta",
  },
  centerRow: {
    addressHours: "{address} · Buka {hours}",
    distance: "{km} km",
    showOnMap: "Tampilkan {name} di peta",
  },
  reportCard: {
    caseTitle: "Kasus #{code}",
    biteTime: "Waktu gigitan",
    category: "Kategori",
    wound: "Luka",
    animal: "Hewan",
    vaccine: "Vaksin hewan",
    desa: "Desa",
    categoryValue: "{category} · Risiko hewan {risk}",
    woundValue: "{contact} di {bodyPart}, {bleeding}",
    animalValue: "{animal}, {condition}",
    desaValue: "{desa}, {kecamatan}",
    bleeding: { ya: "berdarah", tidak: "tidak berdarah", tidak_tahu: "perdarahan tidak diketahui" },
    animalOwnership: {
      berpemilik: "{species} berpemilik",
      tanpa_pemilik: "{species} tanpa pemilik",
      tidak_tahu: "{species}, pemilik tidak diketahui",
    },
    condition: { tampak_sehat: "tampak sehat", tampak_sakit: "tampak sakit", tidak_tahu: "kondisi tidak diketahui" },
    vaccineValue: {
      divaksin: "Sudah divaksin",
      belum: "Belum divaksin",
      tidak_jelas: "Tidak jelas, dianggap paling berat",
    },
    scan: "Pindai untuk melihat status kasus dan observasi hewan.",
    disclaimer:
      "RAKSA bukan alat diagnosis. Keputusan pemberian vaksin anti rabies (VAR/SAR) dibuat oleh tenaga kesehatan.",
    created: "Dibuat {date}",
    qrLabel: "Kode QR status kasus #{code}",
    saveAsImage: "Simpan sebagai gambar",
    saved: "Kartu laporan tersimpan di galeri.",
  },
  summary: {
    /** Contact with body part, e.g. "gigitan jari tangan". */
    contactBodyPart: "{contact} {bodyPart}",
    animalOwnership: {
      berpemilik: "{species} berpemilik",
      tanpa_pemilik: "{species} liar",
      tidak_tahu: "{species}",
    },
    vaccinatedAgo: "divaksin {n} bulan lalu",
  },
}

export const caseUiEn: typeof caseUiId = {
  urgencyCard: {
    todaySubtitle: "Go to a Rabies Center or Puskesmas today.",
    reasonsPrefix: "Because: ",
    reasonSeparator: " · ",
    within24Subtitle: "Go to a health facility by {date} at {time}.",
    within24Required: "Still go to a health facility. Only a health worker can assess this wound.",
    findRabiesCenter: "Find the nearest Rabies Center",
  },
  nextSteps: {
    title: "Next steps",
    steps: [
      { title: "Wash the wound now", desc: "Soap and running water, 15 minutes." },
      { title: "Go to a Rabies Center today", desc: "Show the report card or QR code." },
      { title: "Follow the health worker", desc: "Vaccines are given based on their assessment." },
      { title: "Follow the animal's status", desc: "Updates appear on your case page." },
    ],
  },
  deadlineMeter: {
    remaining: "Time left",
    limit: "24-hour limit",
    bitten: "Bitten",
    deadline: "Deadline",
  },
  observationTimeline: {
    day: "Day {n}",
    label: "Day {day} of {total}",
  },
  map: {
    label: "Map of the nearest Rabies Centers",
    yourLocation: "Your location",
    marker: "Rabies Center {n}",
    hours: "Open {hours}",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
  },
  centerRow: {
    addressHours: "{address} · Open {hours}",
    distance: "{km} km",
    showOnMap: "Show {name} on the map",
  },
  reportCard: {
    caseTitle: "Case #{code}",
    biteTime: "Bite time",
    category: "Category",
    wound: "Wound",
    animal: "Animal",
    vaccine: "Animal vaccine",
    desa: "Village",
    categoryValue: "{category} · Animal risk {risk}",
    woundValue: "{contact} on the {bodyPart}, {bleeding}",
    animalValue: "{animal}, {condition}",
    desaValue: "{desa}, {kecamatan}",
    bleeding: { ya: "bleeding", tidak: "not bleeding", tidak_tahu: "bleeding unknown" },
    animalOwnership: {
      berpemilik: "Owned {species}",
      tanpa_pemilik: "Stray {species}",
      tidak_tahu: "{species}, owner unknown",
    },
    condition: { tampak_sehat: "looks healthy", tampak_sakit: "looks sick", tidak_tahu: "condition unknown" },
    vaccineValue: {
      divaksin: "Vaccinated",
      belum: "Not vaccinated",
      tidak_jelas: "Unclear, treated as most severe",
    },
    scan: "Scan to see the case status and animal observation.",
    disclaimer:
      "RAKSA is not a diagnostic tool. The decision to give rabies vaccine (VAR/SAR) is made by a health worker.",
    created: "Created {date}",
    qrLabel: "QR code for the status of case #{code}",
    saveAsImage: "Save as image",
    saved: "Report card saved to your gallery.",
  },
  summary: {
    contactBodyPart: "{bodyPart} {contact}",
    animalOwnership: {
      berpemilik: "owned {species}",
      tanpa_pemilik: "stray {species}",
      tidak_tahu: "{species}",
    },
    vaccinatedAgo: "vaccinated {n} months ago",
  },
}
