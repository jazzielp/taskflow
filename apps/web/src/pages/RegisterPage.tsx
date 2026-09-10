import { LIMITS } from '@taskflow/contracts'
import { useNavigate } from 'react-router'

import { AuthLayout } from '../layouts/AuthLayout'
import { AuthForm } from '../features/auth/AuthForm'
import { useAuth } from '../features/auth/use-auth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  return (
    <AuthLayout
      headline="Tu cuenta es la frontera de lo que puedes ver."
      copy="El registro emite un JWT con caducidad. A partir de ahí, cada petición demuestra quién eres y el backend decide qué puedes tocar."
    >
      <AuthForm
        eyebrow="NUEVA CUENTA"
        title="Crea tu cuenta"
        subtitle="Dos minutos y tienes tu primer proyecto en marcha."
        fields={[
          { name: 'name', label: 'Nombre', autoComplete: 'name' },
          { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
          {
            name: 'password',
            label: 'Contraseña',
            type: 'password',
            autoComplete: 'new-password',
            // El mínimo sale del contrato, no de un número escrito a mano aquí.
            hint: `Mínimo ${LIMITS.passwordMinLength} caracteres`,
          },
        ]}
        submitLabel="Crear cuenta"
        footerText="¿Ya tienes cuenta?"
        footerLinkLabel="Inicia sesión"
        footerLinkTo="/login"
        onSubmit={async (values) => {
          await register({
            name: values.name ?? '',
            email: values.email ?? '',
            password: values.password ?? '',
          })
          await navigate('/projects', { replace: true })
        }}
      />
    </AuthLayout>
  )
}
