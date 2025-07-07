import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import '@testing-library/jest-dom';

describe('StatCard', () => {
  const defaultProps = {
    title: 'Test Title',
    value: '42',
    subtitle: 'Test subtitle',
    icon: TrendingUp
  };

  describe('renderização básica', () => {
    it('deve renderizar com propriedades obrigatórias', () => {
      render(<StatCard {...defaultProps} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    });

    it('deve renderizar o ícone corretamente', () => {
      render(<StatCard {...defaultProps} />);

      // Verificar se o ícone está presente (através da classe SVG)
      const iconElement = document.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
    });

    it('deve aplicar cores padrão quando não especificadas', () => {
      render(<StatCard {...defaultProps} />);

      const iconElement = document.querySelector('svg');
      const valueElement = screen.getByText('42');

      expect(iconElement).toHaveClass('text-muted-foreground');
      expect(valueElement).toHaveClass('text-foreground');
    });
  });

  describe('personalização de cores', () => {
    it('deve aplicar cor personalizada do ícone', () => {
      render(
        <StatCard
          {...defaultProps}
          iconColor="text-blue-500"
        />
      );

      const iconElement = document.querySelector('svg');
      expect(iconElement).toHaveClass('text-blue-500');
    });

    it('deve aplicar cor personalizada do valor', () => {
      render(
        <StatCard
          {...defaultProps}
          valueColor="text-green-600"
        />
      );

      const valueElement = screen.getByText('42');
      expect(valueElement).toHaveClass('text-green-600');
    });

    it('deve aplicar ambas as cores personalizadas', () => {
      render(
        <StatCard
          {...defaultProps}
          iconColor="text-red-500"
          valueColor="text-blue-600"
        />
      );

      const iconElement = document.querySelector('svg');
      const valueElement = screen.getByText('42');

      expect(iconElement).toHaveClass('text-red-500');
      expect(valueElement).toHaveClass('text-blue-600');
    });
  });

  describe('tipos de valor', () => {
    it('deve renderizar valor numérico', () => {
      render(
        <StatCard
          {...defaultProps}
          value={123}
        />
      );

      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('deve renderizar valor string', () => {
      render(
        <StatCard
          {...defaultProps}
          value="Custom Value"
        />
      );

      expect(screen.getByText('Custom Value')).toBeInTheDocument();
    });

    it('deve renderizar valor zero', () => {
      render(
        <StatCard
          {...defaultProps}
          value={0}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('deve renderizar valores negativos', () => {
      render(
        <StatCard
          {...defaultProps}
          value={-5}
        />
      );

      expect(screen.getByText('-5')).toBeInTheDocument();
    });

    it('deve renderizar valores decimais', () => {
      render(
        <StatCard
          {...defaultProps}
          value="85.5%"
        />
      );

      expect(screen.getByText('85.5%')).toBeInTheDocument();
    });
  });

  describe('diferentes ícones', () => {
    it('deve renderizar com ícone CheckCircle', () => {
      render(
        <StatCard
          {...defaultProps}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
      );

      const iconElement = document.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveClass('text-green-500');
    });

    it('deve renderizar com ícone AlertCircle', () => {
      render(
        <StatCard
          {...defaultProps}
          icon={AlertCircle}
          iconColor="text-yellow-500"
        />
      );

      const iconElement = document.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveClass('text-yellow-500');
    });
  });

  describe('conteúdo longo', () => {
    it('deve lidar com títulos longos', () => {
      const longTitle = 'Este é um título muito longo que pode quebrar linhas';

      render(
        <StatCard
          {...defaultProps}
          title={longTitle}
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('deve lidar com subtítulos longos', () => {
      const longSubtitle = 'Este é um subtítulo muito longo que pode precisar de mais espaço';

      render(
        <StatCard
          {...defaultProps}
          subtitle={longSubtitle}
        />
      );

      expect(screen.getByText(longSubtitle)).toBeInTheDocument();
    });

    it('deve lidar com valores longos', () => {
      const longValue = '1,234,567,890';

      render(
        <StatCard
          {...defaultProps}
          value={longValue}
        />
      );

      expect(screen.getByText(longValue)).toBeInTheDocument();
    });
  });

  describe('estrutura HTML', () => {
    it('deve ter a estrutura de Card correta', () => {
      render(<StatCard {...defaultProps} />);

      // Verificar se está usando os componentes Card corretos
      expect(document.querySelector('[class*="card"]')).toBeInTheDocument();
    });

    it('deve ter classes CSS apropriadas para styling', () => {
      render(<StatCard {...defaultProps} />);

      const valueElement = screen.getByText('42');
      const subtitleElement = screen.getByText('Test subtitle');

      expect(valueElement).toHaveClass('text-2xl', 'font-bold');
      expect(subtitleElement).toHaveClass('text-xs', 'text-muted-foreground');
    });
  });

  describe('casos de uso reais', () => {
    it('deve renderizar estatística de projetos ativos', () => {
      render(
        <StatCard
          title="Projetos Ativos"
          value={6}
          subtitle="Em andamento"
          icon={TrendingUp}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
        />
      );

      expect(screen.getByText('Projetos Ativos')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('Em andamento')).toBeInTheDocument();
    });

    it('deve renderizar estatística de tarefas concluídas', () => {
      render(
        <StatCard
          title="Concluídos"
          value={25}
          subtitle="Finalizados"
          icon={CheckCircle}
          iconColor="text-green-500"
          valueColor="text-green-600"
        />
      );

      expect(screen.getByText('Concluídos')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Finalizados')).toBeInTheDocument();
    });

    it('deve renderizar progresso percentual', () => {
      render(
        <StatCard
          title="Progresso Médio"
          value="78.5%"
          subtitle="Dos projetos"
          icon={TrendingUp}
          iconColor="text-purple-500"
          valueColor="text-purple-600"
        />
      );

      expect(screen.getByText('Progresso Médio')).toBeInTheDocument();
      expect(screen.getByText('78.5%')).toBeInTheDocument();
      expect(screen.getByText('Dos projetos')).toBeInTheDocument();
    });
  });
});
