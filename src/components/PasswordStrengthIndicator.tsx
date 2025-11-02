import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const commonPasswords = [
  'password', '12345678', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', '123456789', 'password1'
];

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const requirements: PasswordRequirement[] = [
    {
      label: "لا يقل عن 8 أحرف",
      test: (pwd) => pwd.length >= 8
    },
    {
      label: "يحتوي على رقم واحد على الأقل",
      test: (pwd) => /\d/.test(pwd)
    },
    {
      label: "يحتوي على رمز خاص (!@#$%^&*)",
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ];

  const passedRequirements = requirements.filter(req => req.test(password)).length;
  const allPassed = passedRequirements === requirements.length;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          قوة كلمة المرور
        </p>
        <span className="text-xs font-medium">
          {passedRequirements}/{requirements.length}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            passedRequirements === 0 ? 'bg-transparent' :
            passedRequirements <= 2 ? 'bg-destructive' :
            passedRequirements <= 4 ? 'bg-orange-500' :
            passedRequirements === 5 ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${(passedRequirements / requirements.length) * 100}%` }}
        />
      </div>

      {/* Requirements List */}
      {password && (
        <div className="space-y-1 pt-2">
          {requirements.map((requirement, index) => {
            const passed = requirement.test(password);
            return (
              <div
                key={index}
                className={`flex items-center gap-2 text-xs transition-colors ${
                  passed ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                {passed ? (
                  <Check className="h-3.5 w-3.5 flex-shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 flex-shrink-0" />
                )}
                <span>{requirement.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {allPassed && password && (
        <p className="text-xs text-green-600 font-medium flex items-center gap-1 pt-1">
          <Check className="h-3.5 w-3.5" />
          كلمة المرور قوية وآمنة
        </p>
      )}
    </div>
  );
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('MIN_LENGTH');
  }
  
  if (!/\d/.test(password)) {
    errors.push('NO_NUMBER');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('NO_SPECIAL_CHAR');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
