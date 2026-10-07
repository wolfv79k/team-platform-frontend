import Image from 'next/image'
import { ArrowRight, EyeOff } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@/shared/components/ui/field'
import Link from 'next/link'

function RegisterModal() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h1 className="mb-6 text-center text-3xl font-semibold">
        Зарегестрируйся и создай профиль
      </h1>

      <div
        className="
          w-full
          max-w-95
          rounded-2xl
          border
          border-border
          bg-card
          px-5
          py-5
          shadow-[0_8px_30px_rgba(0,0,0,0.10)]
        "
      >
        <form className="flex flex-col">
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="
              h-10
              w-full
              rounded-full
              border-border
              bg-background
              text-sm
              font-normal
              shadow-sm
            "
          >
            <Image
              src="/Google_Favicon_2025.svg"
              width={18}
              height={18}
              alt="Google"
            />

            Войти через Google
          </Button>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />

            <span className="text-xs text-muted-foreground">
              или продолжи с почтой
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email */}
          <Field>
            <FieldLabel
              htmlFor="email"
              className="text-sm font-normal"
            >
              Адрес электронной почты
            </FieldLabel>

            <FieldContent>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="h-9 rounded-md"
              />
            </FieldContent>
          </Field>

          {/* Password */}
          <Field className="mt-4">
            <FieldLabel
              htmlFor="password"
              className="text-sm font-normal"
            >
              Пароль
            </FieldLabel>

            <FieldContent>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="h-9 rounded-md pr-10"
                />

                <button
                  type="button"
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >
                  <EyeOff size={16} />
                </button>
              </div>
            </FieldContent>
          </Field>

          {/* Submit */}
          <Button
            type="submit"
            className="mt-6 h-9 w-full rounded-md text-sm font-semibold"
          >
            Создать профиль
            <ArrowRight size={17} className='mt-0.5'/>
          </Button>

          {/* Bottom text */}
          <p className="mt-5 ml-1 text-muted-foreground text-sm ">
            Уже регистрировались? <Link className='text-sky-500 hover:text-primary' href="/auth/login">Войдите в аккаунт</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterModal