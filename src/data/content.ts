/**
 * The single file to edit when changing the invitation.
 * Every piece of copy, every date, place and photo path comes from here.
 *
 * Display strings stay in Vietnamese because that is what guests read.
 */

export const content = {
  /** Full name: footer and the wax-seal initial. */
  graduateName: "Nguyễn Ngọc Huyền Trân",
  /** Short name for the link preview, where the full one wraps to three lines. */
  shortName: "Huyền Trân",
  /** The line on the card that slides out of the envelope. */
  envelopeGreeting: "Trân xin chào",
  /** Small line above the title. */
  overline: "Trân tốt nghiệp rùi,\ntới chơi với Trân nhaa!",
  /** Poster-style title. \n forces the line break. */
  title: "Tran’s Graduation\nInvitation",
  /** Invitation line. One shared link for everyone, so it is addressed generally. */
  inviteLine: "Thương mời Anh Chị Em Bạn dì",
  inviteName: "thân thương",

  /** Ceremony start, used by the countdown. ISO format; +07:00 is Vietnam time. */
  eventStart: "2026-09-26T15:30:00+07:00",

  date: {
    weekday: "Thứ Bảy",
    day: "26",
    month: "Tháng 9",
    year: "2026",
    full: "26 . 09 . 2026",
  },

  time: {
    range: "15h30 – 17h",
  },

  venue: {
    /** Rendered in bold above the venue name. */
    floor: "Tầng trệt",
    name: "Cơ sở A – UEH",
    lines: ["59C Nguyễn Đình Chiểu", "Phường Xuân Hòa", "TP. Hồ Chí Minh"],
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=59C+Nguy%E1%BB%85n+%C4%90%C3%ACnh+Chi%E1%BB%83u+UEH+H%E1%BB%93+Ch%C3%AD+Minh",
  },

  /**
   * The last window happens somewhere else. When a guest picks it, their card
   * carries this address instead of the ceremony one, and the directions
   * button follows suit.
   */
  altVenue: {
    triggerSlot: "16h30 – 17h",
    name: "Hồ Con Rùa",
    lines: ["Công trường Quốc tế, Phường Xuân Hòa, TP. Hồ Chí Minh"],
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=H%E1%BB%93+Con+R%C3%B9a+TP+H%E1%BB%93+Ch%C3%AD+Minh",
  },

  /** Shown as the fourth card in the ceremony details. */
  contact: {
    label: "Liên hệ",
    /** Numbers are grouped for reading; the tel: link keeps the raw digits. */
    people: [
      { name: "Trân", phone: "0385 592 932", href: "tel:+84385592932" },
      { name: "Duy", note: "supporter", phone: "0865 208 467", href: "tel:+84865208467" },
    ],
  },

  /** Hero photo. Drop the file into public/images/ and point `src` at it. */
  heroPhoto: {
    src: "/images/hero-16x9.jpg",
    alt: "Nguyễn Ngọc Huyền Trân",
    caption: "", // empty means no caption under the photo
    // The file's real pixel size. The frame follows this aspect ratio, so
    // swapping in a photo of different proportions only needs these two numbers.
    // Use a new filename when replacing a photo: Next caches optimised images
    // by path, so overwriting the same name keeps serving the old one.
    width: 2026,
    height: 1138,
  },



  /** Parking options around the venue. */
  parking: {
    heading: "🛵 Bãi gửi xe",
    intro:
      "Khu vực quanh trường hơi khó gửi xe, anh/chị/em tham khảo mấy chỗ này nhaa",
    spots: [
      {
        rank: "Ưu tiên 1",
        name: "Nhà Văn hóa Thanh niên",
        address: "21 Phạm Ngọc Thạch",
        url: "https://maps.app.goo.gl/NytLM6W7YpywEbnCA",
      },
      {
        rank: "Gợi ý 2",
        name: "Bãi giữ xe vãng lai",
        address: "Đối diện Đại học Kinh tế, 59C Nguyễn Đình Chiểu",
        url: "https://maps.app.goo.gl/SpyZ59DFsVLF3sVe9",
      },
      {
        rank: "Gợi ý 3",
        name: "Hầm gửi xe toà Highlands Hồ Con Rùa",
        address: "",
        url: "https://maps.app.goo.gl/vBCE4VXaEHuYhk359?g_st=ic",
      },
      {
        rank: "Gợi ý 4",
        name: "Bãi xe Cơ Quan",
        address: "Thường rất đông",
        url: "https://maps.app.goo.gl/TA4opTVdPcrrcES88",
      },
    ],
    note:
      "Ngoài ra khu vực vòng quanh Hồ Con Rùa cũng có các bãi xe vãng lai, anh/chị có thể tham khảo ạ. Giá gửi xe trung bình khoảng 10.000đ.",
  },

  /**
   * Photo album. Empty, so the gallery section hides itself.
   * To turn it on, drop files into public/images/ and list them here:
   *   { src: "/images/g1.jpg", alt: "First day", caption: "Year one" },
   * Crop them to 4:5 portrait to match the polaroid frame.
   */
  gallery: [] as { src: string; alt: string; caption?: string }[],

  rsvp: {
    heading: "💌 RSVP xác nhận tham dự",
    nameLabel: "Tên của người đẹp trai, đẹp gái làaa",
    namePlaceholder: "Mình là...",
    attendingLabel: "Người đẹp sẽ đến chung vui cùng Trân đúng hông?",
    attendingOptions: ["Chắc chắn rùi", "Hông được rùi"],
    /**
     * The option that means "I cannot make it". Picking it drops the time
     * windows from the form and ends on a letter instead of an invitation.
     */
    declineOption: "Hông được rùi",
    /** Guests can tick more than one slot. */
    slotLabel: "Người đẹp ghé được khung giờ nào zaa? (chọn nhiều cũng oki)",
    /**
     * Guests may tick several. The first one is the ceremony itself, which
     * runs before the reception windows and so is spelled out.
     */
    slotOptions: [
      "Dự lễ tốt nghiệp (13h – 16h)",
      "15h30 – 16h",
      "16h – 16h30",
      "16h30 – 17h",
    ],
    messageLabel: "Nhắn gì đó cho Trân hongg",
    messagePlaceholder: "Tuỳ người đẹp, hông bắt buộc",
    /** Replaces the two lines above for someone who cannot come. */
    wishLabel: "Gửi Trân một lời chúc nhaa",
    wishPlaceholder: "Chúc Trân...",
    submit: "Gửi tín hiệu tới Trân nhaa",
    submitting: "Đang gửi...",
    /** The card appears at once; this only warns that the reply did not land. */
    errorText:
      "Thiệp của người đẹp xong rồi, nhưng tin nhắn chưa tới được Trân. Nhắn giúp Trân qua số ở trên nha!",
    doneTitle: "Trân nhận được rồi nhaa!",
    doneNote: "Cảm ơn người đẹp nhiều. Hẹn gặp vào",
    /** The letter below says the rest, so this one stands alone. */
    doneTitleAway: "Trân đọc được rồi nhaa!",
  },

  /** The personalised card drawn after someone RSVPs. */
  card: {
    invitePrefix: "Thương mời Anh/Chị/Bạn",
    slotsHeading: "Khung giờ bạn ghé",
    contactHeading: "Liên hệ",
    saveLabel: "Lưu thiệp về máy",
    mapLabel: "Xem đường đi",
  },

  /**
   * Handed to a guest who cannot come, in place of the invitation card.
   * Nobody wants a picture of a party they are missing.
   */
  thanksLetter: {
    salutation: "Gửi",
    paragraphs: [
      "Ơ hông ghé được hả 🥺 Hông sao đâu nhaa.",
      "Vậy nợ Trân một buổi cà phê nghen, lúc nào cũng được á.",
    ],
    /** Heading above the guest's own words, echoed back to them. */
    wishHeading: "Người đẹp chúc Trân nè",
    signature: "Trân",
  },

  footer: {
    thanks: "Cảm ơn mọi người đã đến chung vui cùng Trân 🎓",
    signature: "See u soon",
    closing: "Nhớ đến á nha, thân lắm mới mời á hihi 😇",
  },

  /** Background music. Drop an mp3 into public/audio/ and set the path. null hides the button. */
  music: null as string | null,
};

export type Content = typeof content;
