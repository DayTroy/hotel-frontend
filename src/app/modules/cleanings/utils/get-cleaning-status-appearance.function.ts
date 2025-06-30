export function getCleaningStatusAppearance(
  status: string
): 'negative' | 'primary' | 'positive' {
  switch (status) {
    case 'Новый':
      return 'negative';
    case 'В работе':
      return 'primary';
    case 'Выполнено':
      return 'positive';
    default:
      return 'negative';
  }
}
