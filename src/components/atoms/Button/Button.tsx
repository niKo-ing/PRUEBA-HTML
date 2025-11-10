/**
 * Componente Button - Botón básico clicable
 * Props: label (string) texto del botón; onClick (función opcional) manejador de clic
 * Estado: no maneja estado interno; Dependencias: ninguna externa
 */
/**
 * Renderiza un botón con etiqueta y manejador opcional
 * @param {{ label: string, onClick?: () => void }} props - Texto y manejador
 * @returns {JSX.Element} Botón HTML
 */
type ButtonProps = {
  label: string;
  onClick?: () => void;
};

export default function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}