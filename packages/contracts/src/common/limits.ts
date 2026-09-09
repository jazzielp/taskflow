/**
 * Límites de longitud. Forman parte del contrato: la API los aplica y la UI
 * los usa para dar feedback antes de enviar el formulario.
 */
export const LIMITS = {
  nameMinLength: 2,
  nameMaxLength: 120,
  emailMaxLength: 254,
  passwordMinLength: 8,
  passwordMaxLength: 128,
  projectNameMinLength: 1,
  projectNameMaxLength: 120,
  descriptionMaxLength: 1000,
  taskTitleMinLength: 1,
  taskTitleMaxLength: 150,
} as const
