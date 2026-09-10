import { useNavigate } from 'react-router'

import { AuthLayout } from '../layouts/AuthLayout'
import { AuthForm } from '../features/auth/AuthForm'
import { useAuth } from '../features/auth/use-auth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  return (
    <AuthLayout
      headline="Organiza el trabajo por proyectos, no por listas sueltas."
      copy="Cada tarea vive dentro de un proyecto y solo la ve quien es su dueño. La API valida todo lo que entra; la interfaz solo se adelanta para avisarte antes."
    >
      <AuthForm
        eyebrow="ACCESO"
        title="Inicia sesión"
        subtitle="Entra con tu cuenta para volver a tus proyectos."
        fields={[
          { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
          {
            name: 'password',
            label: 'Contraseña',
            type: 'password',
            autoComplete: 'current-password',
          },
        ]}
        submitLabel="Entrar"
        footerText="¿Todavía no tienes cuenta?"
        footerLinkLabel="Crear una"
        footerLinkTo="/register"
        onSubmit={async (values) => {
          await login({ email: values.email ?? '', password: values.password ?? '' })
          await navigate('/projects', { replace: true })
        }}
      />
    </AuthLayout>
  )
}
