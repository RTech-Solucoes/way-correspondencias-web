'use client';

import { useState } from 'react';
import { EyeIcon, EyeClosedIcon, LockIcon, EnvelopeIcon, UserIcon, PhoneIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/utils/utils';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: string;
  acceptTerms: boolean;
}

const ROLES = [
  { value: 'VISUALIZADOR', label: 'Visualizador' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'APROVADOR', label: 'Aprovador' },
];

export default function CadastroPage() {
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; title: string; description: string }>({ open: false, title: '', description: '' });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    }
    return value;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve conter ao menos uma letra maiúscula, minúscula e um número';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }


    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido. Use o formato (11) 99999-9999';
    }

    if (!formData.role) {
      newErrors.role = 'Cargo é obrigatório';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Cadastro realizado:', formData);
        setDialog({ open: true, title: 'Sucesso', description: 'Cadastro realizado com sucesso!' });

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          role: '',
          acceptTerms: false,
        });
      } catch (error) {
        console.error('Erro no cadastro:', error);
        setDialog({ open: true, title: 'Erro', description: 'Erro ao realizar cadastro. Tente novamente.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Muito fraca', 'Fraca', 'Regular', 'Boa', 'Muito forte'];

  return (
    <>
      <AlertDialog open={dialog.open} onOpenChange={(open) => setDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialog(prev => ({ ...prev, open: false }))}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            Nome *
          </Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Seu nome"
              className={cn(
                "pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                errors.firstName && "border-red-500 focus:border-red-500"
              )}
              disabled={isLoading}
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            Sobrenome *
          </Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Seu sobrenome"
            className={cn(
              "h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
              errors.lastName && "border-red-500 focus:border-red-500"
            )}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Corporativo *
        </Label>
        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="seu.email@empresa.com"
            className={cn(
              "pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
              errors.email && "border-red-500 focus:border-red-500"
            )}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Senha *
          </Label>
          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Crie uma senha segura"
              className={cn(
                "pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                errors.password && "border-red-500 focus:border-red-500"
              )}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <EyeClosedIcon className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      passwordStrength >= level ? strengthColors[passwordStrength - 1] : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600">
                Força da senha: {strengthLabels[passwordStrength - 1] || 'Muito fraca'}
              </p>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirmar Senha *
          </Label>
          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirme sua senha"
              className={cn(
                "pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                errors.confirmPassword && "border-red-500 focus:border-red-500"
              )}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <EyeClosedIcon className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Telefone *
        </Label>
        <div className="relative">
          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            className={cn(
              "pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
              errors.phone && "border-red-500 focus:border-red-500"
            )}
            disabled={isLoading}
          />
        </div>
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium text-gray-700">
          Cargo *
        </Label>
        <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
          <SelectTrigger className={cn(
            "h-12 bg-gray-50 border-gray-200 focus:bg-white",
            errors.role && "border-red-500"
          )}>
            <SelectValue placeholder="Selecione seu cargo" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role}</p>
        )}
      </div>

      {/* Terms */}
      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
            disabled={isLoading}
            className={cn(errors.acceptTerms && "border-red-500")}
          />
          <div className="space-y-1">
            <Label
              htmlFor="acceptTerms"
              className="text-sm text-gray-600 cursor-pointer leading-5"
            >
              Eu aceito os{' '}
              <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0 h-auto text-sm">
                Termos de Uso
              </Button>{' '}
              e a{' '}
              <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0 h-auto text-sm">
                Política de Privacidade
              </Button>{' '}
              *
            </Label>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600">{errors.acceptTerms}</p>
            )}
          </div>
        </div>
      </div>


      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Criando conta...</span>
          </div>
        ) : (
          <span>Criar Conta</span>
        )}
      </Button>
    </form>
    </>
  );
}