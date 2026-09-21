export const CacheKeys = {
  board: (boardIdOrSlug: number | string) => `board_${boardIdOrSlug}`,
  boardList: () => 'board_list',
} as const