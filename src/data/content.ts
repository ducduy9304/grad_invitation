/**
 * ĐÂY LÀ FILE DUY NHẤT BẠN CẦN SỬA để đổi nội dung thiệp.
 * Mọi chữ, ngày giờ, địa điểm, ảnh đều lấy từ đây.
 */

export const content = {
  /** Tên hiển thị lớn nhất ở hero. */
  graduateName: "Nguyễn Ngọc Huyền Trân",
  /** Dòng nhỏ phía trên tên. */
  overline: "Em tốt nghiệp rùi,\ntới chơi với em nhaa!",
  /** Tiêu đề kiểu poster. */
  title: "Tran’s Graduation\nInvitation",
  /** Câu mời. Vì dùng 1 link chung nên để lời mời chung. */
  inviteLine: "Thương mời Anh Chị Em, Bạn bè",
  inviteName: "thân thương",

  /** Thời điểm bắt đầu buổi lễ — dùng cho đồng hồ đếm ngược. Định dạng ISO, +07:00 là giờ VN. */
  eventStart: "2026-09-26T15:30:00+07:00",

  date: {
    weekday: "Thứ Bảy",
    day: "26",
    month: "Tháng 9",
    year: "2026",
    full: "26 . 09 . 2026",
  },

  time: {
    range: "15:30 – 16:30",
    note: "Khách mời có mặt trước 15 phút nha",
  },

  venue: {
    name: "Cơ sở A – UEH",
    lines: ["59C Nguyễn Đình Chiểu", "Phường Xuân Hòa", "TP. Hồ Chí Minh"],
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=59C+Nguy%E1%BB%85n+%C4%90%C3%ACnh+Chi%E1%BB%83u+UEH+H%E1%BB%93+Ch%C3%AD+Minh",
  },

  /** Ảnh chính dán kiểu polaroid ở hero. Bỏ file vào public/images/. */
  heroPhoto: {
    src: "/images/hero-16x9.jpg",
    alt: "Nguyễn Ngọc Huyền Trân",
    caption: "", // để trống thì không hiện chú thích dưới ảnh
    // Kích thước thật của file. Khung ảnh bám theo đúng tỉ lệ này,
    // nên đổi ảnh khác tỉ lệ thì chỉ cần sửa hai số dưới đây.
    width: 2026,
    height: 1138,
  },



  /** Chỗ gửi xe quanh địa điểm tổ chức. */
  parking: {
    heading: "Chỗ gửi xe",
    intro:
      "Khu vực quanh trường hơi khó gửi xe, anh chị em tham khảo mấy chỗ này nha",
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
      "Ngoài ra khu vực vòng quanh Hồ Con Rùa cũng có các bãi xe vãng lai, anh chị có thể tham khảo ạ. Giá gửi xe trung bình khoảng 10.000đ.",
  },

  /**
   * Album ảnh. Đang để rỗng nên khối "Một chút kỷ niệm" tự ẩn.
   * Muốn bật lại: bỏ ảnh vào public/images/ rồi thêm vào đây, ví dụ
   *   { src: "/images/g1.jpg", alt: "Ngày nhập học", caption: "Năm nhất" },
   * Ảnh nên cắt dọc 4:5 cho khớp khung polaroid.
   */
  gallery: [] as { src: string; alt: string; caption?: string }[],

  rsvp: {
    heading: "💌 RSVP xác nhận tham dự",
    nameLabel: "Tên của người đẹp trai, đẹp gái làaa",
    namePlaceholder: "Mình là...",
    attendingLabel: "Người đẹp sẽ đến chung vui cùng Trân đúng hông?",
    attendingOptions: ["Chắc chắn rùi", "Hông được rùi"],
    messageLabel: "Nhắn gì đó cho Trân nè",
    messagePlaceholder: "Tuỳ người đẹp, hông bắt buộc",
    submit: "Gửi tín hiệu tới Trân nha",
    submitting: "Đang gửi...",
    errorText: "Gửi chưa được, người đẹp thử lại giúp Trân nha.",
    doneTitle: "Trân nhận được rồi nha!",
    doneNote: "Cảm ơn người đẹp nhiều. Hẹn gặp vào",
  },

  footer: {
    thanks: "Cảm ơn mọi người đã đến chung vui cùng Nguyễn Ngọc Huyền Trân 🎓",
    signature: "Hẹn gặp ở lễ tốt nghiệp",
  },

  /** Nhạc nền. Bỏ file mp3 vào public/audio/ rồi đổi đường dẫn. Để null nếu không dùng. */
  music: null as string | null,
};

export type Content = typeof content;
