export const HOBBIES = [
  { id: "fitness", label: "운동/피트니스" },
  { id: "running", label: "러닝/걷기" },
  { id: "hiking_camping", label: "등산/캠핑" },
  { id: "yoga_pilates", label: "요가/필라테스" },
  { id: "cycling", label: "자전거" },
  { id: "golf", label: "골프" },
  { id: "tennis_badminton", label: "테니스/배드민턴" },
  { id: "music_concert", label: "음악/공연" },
  { id: "movie_drama", label: "영화/드라마" },
  { id: "reading_writing", label: "독서/글쓰기" },
  { id: "photo_video", label: "사진/영상" },
  { id: "art_craft", label: "그림/공예" },
  { id: "cooking_food", label: "요리/맛집" },
  { id: "cafe", label: "카페 탐방" },
  { id: "travel", label: "여행" },
  { id: "gaming", label: "게임" },
  { id: "board_game", label: "보드게임" },
  { id: "pets", label: "반려동물" },
  { id: "language_study", label: "외국어/스터디" },
  { id: "finance_investment", label: "재테크/투자" },
  { id: "startup_sideproject", label: "창업/사이드프로젝트" },
  { id: "volunteering", label: "봉사활동" },
  { id: "other", label: "기타" },
] as const;

export type HobbyId = (typeof HOBBIES)[number]["id"];

export const HOBBY_IDS = HOBBIES.map((hobby) => hobby.id);

export function getHobbyLabel(value: string) {
  return HOBBIES.find((hobby) => hobby.id === value)?.label ?? value;
}
