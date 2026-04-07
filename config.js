/**
 * Modern Minimal Wedding Invitation Configuration
 *
 * Edit the values below to customize your wedding invitation.
 * Image files should be placed in the corresponding images/ subfolders
 * using sequential filenames (1.jpg, 2.jpg, ...).
 * The code auto-detects images by trying sequential filenames.
 *
 * Image folder conventions:
 *   images/hero/1.jpg       - Main wedding photo (single file)
 *   images/poster/1.jpg     - Poster section image (single file)
 *   images/story/1.jpg, ... - Story section photos (auto-detected)
 *   images/gallery/1.jpg, . - Gallery photos (auto-detected)
 *   images/location/1.jpg   - Venue/map image (single file)
 *   images/og/1.jpg         - Kakao share thumbnail (single file)
 */

const CONFIG = {
  // ── 메인 (히어로) ──
  groom: {
    name: "이형규",
    nameEn: "Lee Hyeong Gyu",
    father: "이재요",
    mother: "신영옥",
    fatherDeceased: false,
    motherDeceased: false
  },

  bride: {
    name: "이예윤",
    nameEn: "Lee ye yun",
    father: "이병열",
    mother: "한은옥",
    fatherDeceased: false,
    motherDeceased: false
  },

  wedding: {
    date: "2026-05-10",
    time: "11:00",
    venue: "제이오스티엘",
    hall: "2층 티파니홀",
    navigationName: "제이오스티엘",
    address: "서울 구로구 경인로 565",
    tel: "02-2635-2222",
    coordinates: {
      lat: 37.5665,
      lng: 126.978
    },
    naverMap: {
      zoom: 17
    },
    mapLinks: {
      naver: "https://naver.me/xiqui4N7",
      tmap: "https://tmap.life/1ba91acb",
      kakaoNavi: ""
    },
    kakaoNavi: {
      javascriptKey: "7b0506c22e0df565d3c085843cb67aa4"
    },
    transport: {
      parking: [
        "구로기계공구상가 B,D 블럭 5번 게이트 이용"
      ],
      subway: [
        { lineColor: "#1f4fa3", text: "1호선 구로역 2번, 3번 출구 도보 3분" }
      ],
      bus: [
        "구로역 : 5615, 5714, 6512",
        "구로기계공구상가 : 5630, 6516, 6613, 571, 654",
        "마을버스 : 구로09, 양천04번"
      ]
    }
  },

  // ── 인사말 ──
  invitation: {
    title: "소중한 분들을 초대합니다",
    message: "서로 다른 길을 걸어온 두 사람이\n이제 같은 길을 함께 걸어가려 합니다.\n\n바쁘시더라도 오셔서\n축복해 주시면 감사하겠습니다."
  },

  information: {
    title: "주차장 안내",
    primary: "구로기계공구상가 B,D 블럭 5번 게이트 이용 (5시간 무료주차)",
    secondary: "주차 안내요원의 안내에 따라 이동해 주시면 더욱 편리하게 이용하실 수 있습니다."
  },

  attendance: {
    title: "참석 의사 전달",
    message: "특별한 날 축하의 마음으로 참석해주시는 모든 분들을 한 분 한 분 더욱 귀하게 모실 수 있도록, 아래 버튼으로 신랑 & 신부에게 꼭 참석여부 전달을 부탁드립니다.",
    buttonLabel: "참석의사 전달하기",
    sheetEndpoint: "",
    privacyNoticeUrl: ""
  },

  // ── 포스터 섹션 ──
  poster: {
    lettering: "Our beginning, in one frame",
    alt: "포스터 이미지"
  },

  // ── 우리의 이야기 ──
  story: {
    title: "우리의 이야기",
    content: "서로 다른 길을 걷던 두 사람이\n하나의 길을 함께 걷게 되었습니다.\n\n여러분을 소중한 자리에 초대합니다."
  },

  // ── 오시는 길 ──
  // (mapLinks는 wedding 객체 내에 포함)

  // ── 마음 전하실 곳 ──
  accounts: {
    groom: [
      { role: "아버지", name: "이재요", bank: "국민은행", number: "047050024558" }
    ],
    bride: [
      { role: "신부", name: "이예윤", bank: "국민은행", number: "62510201279691" },
      { role: "아버지", name: "이병열", bank: "농협", number: "216025-56-062201" },
      { role: "어머니", name: "한은옥", bank: "국민", number: "594801-01-018762" }
    ]
  },

  // ── 링크 공유 시 나타나는 문구 ──
  kakaoShare: {
    jsKey: "",
    title: "결혼식에 초대합니다",
    description: ""
  }
};
