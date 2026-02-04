/**
 * Converte minutos em formato "X horas e Y minutos"
 * @param minutes - Número de minutos
 * @returns String formatada
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hora${hours !== 1 ? 's' : ''} e ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
}
