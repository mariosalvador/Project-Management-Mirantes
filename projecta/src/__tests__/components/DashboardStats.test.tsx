import { render, screen } from '@testing-library/react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import '@testing-library/jest-dom';

describe('DashboardStats', () => {
  const mockStats = {
    total: 10,
    active: 6,
    completed: 3,
    planning: 1,
    onHold: 0
  };

  const defaultProps = {
    stats: mockStats,
    totalTasks: 45,
    completedTasks: 20,
    totalTeamMembers: 8,
    avgProgress: 65.5
  };

  describe('renderização', () => {
    it('deve renderizar todas as estatísticas corretamente', () => {
      render(<DashboardStats {...defaultProps} />);

      // Verificar se todos os cards de estatísticas estão presentes
      expect(screen.getByText('Total de Projetos')).toBeInTheDocument();
      expect(screen.getByText('Projetos Ativos')).toBeInTheDocument();
      expect(screen.getByText('Concluídos')).toBeInTheDocument();
      expect(screen.getByText('Total de Tarefas')).toBeInTheDocument();
      expect(screen.getByText('Tarefas Concluídas')).toBeInTheDocument();
      expect(screen.getByText('Membros da Equipe')).toBeInTheDocument();
      expect(screen.getByText('Progresso Médio')).toBeInTheDocument();
    });

    it('deve exibir os valores corretos', () => {
      render(<DashboardStats {...defaultProps} />);

      // Verificar valores principais
      expect(screen.getByText('10')).toBeInTheDocument(); // Total de projetos
      expect(screen.getByText('6')).toBeInTheDocument(); // Projetos ativos
      expect(screen.getByText('3')).toBeInTheDocument(); // Projetos concluídos
      expect(screen.getByText('45')).toBeInTheDocument(); // Total de tarefas
      expect(screen.getByText('20')).toBeInTheDocument(); // Tarefas concluídas
      expect(screen.getByText('8')).toBeInTheDocument(); // Membros da equipe
      expect(screen.getByText('65.5%')).toBeInTheDocument(); // Progresso médio
    });

    it('deve exibir os subtítulos corretos', () => {
      render(<DashboardStats {...defaultProps} />);

      expect(screen.getByText('6 ativos')).toBeInTheDocument();
      expect(screen.getByText('Em andamento')).toBeInTheDocument();
      expect(screen.getByText('Finalizados')).toBeInTheDocument();
      expect(screen.getByText('Total criadas')).toBeInTheDocument();
      expect(screen.getByText('Finalizadas')).toBeInTheDocument();
      expect(screen.getByText('Total ativo')).toBeInTheDocument();
      expect(screen.getByText('Dos projetos')).toBeInTheDocument();
    });
  });

  describe('casos extremos', () => {
    it('deve lidar com valores zero', () => {
      const zeroStats = {
        stats: {
          total: 0,
          active: 0,
          completed: 0,
          planning: 0,
          onHold: 0
        },
        totalTasks: 0,
        completedTasks: 0,
        totalTeamMembers: 0,
        avgProgress: 0
      };

      render(<DashboardStats {...zeroStats} />);

      expect(screen.getAllByText('0')).toHaveLength(6); // 6 valores zero
      expect(screen.getByText('0%')).toBeInTheDocument(); // Progresso médio
      expect(screen.getByText('0 ativos')).toBeInTheDocument(); // Subtitle
    });

    it('deve lidar com valores altos', () => {
      const highStats = {
        stats: {
          total: 999,
          active: 500,
          completed: 400,
          planning: 99,
          onHold: 0
        },
        totalTasks: 5000,
        completedTasks: 3000,
        totalTeamMembers: 150,
        avgProgress: 99.9
      };

      render(<DashboardStats {...highStats} />);

      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText('3000')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('99.9%')).toBeInTheDocument();
    });

    it('deve lidar com progresso de 100%', () => {
      const completedStats = {
        ...defaultProps,
        avgProgress: 100
      };

      render(<DashboardStats {...completedStats} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('cálculos derivados', () => {
    it('deve mostrar o subtítulo correto para projetos ativos', () => {
      const customStats = {
        ...defaultProps,
        stats: {
          ...mockStats,
          active: 15
        }
      };

      render(<DashboardStats {...customStats} />);

      expect(screen.getByText('15 ativos')).toBeInTheDocument();
    });

    it('deve manter consistência entre total e partes', () => {
      const consistentStats = {
        stats: {
          total: 20,
          active: 10,
          completed: 8,
          planning: 2,
          onHold: 0
        },
        totalTasks: 100,
        completedTasks: 60,
        totalTeamMembers: 25,
        avgProgress: 75.5
      };

      render(<DashboardStats {...consistentStats} />);

      expect(screen.getByText('20')).toBeInTheDocument(); // Total
      expect(screen.getByText('10')).toBeInTheDocument(); // Ativos
      expect(screen.getByText('8')).toBeInTheDocument(); // Concluídos
      expect(screen.getByText('10 ativos')).toBeInTheDocument(); // Subtitle consistente
    });
  });

  describe('acessibilidade', () => {
    it('deve ter estrutura de heading apropriada', () => {
      render(<DashboardStats {...defaultProps} />);

      // Os títulos devem estar presentes e acessíveis
      expect(screen.getByText('Total de Projetos')).toBeInTheDocument();
      expect(screen.getByText('Projetos Ativos')).toBeInTheDocument();
      expect(screen.getByText('Concluídos')).toBeInTheDocument();
    });

    it('deve ter conteúdo legível por screen readers', () => {
      render(<DashboardStats {...defaultProps} />);

      // Verificar se o conteúdo é estruturado de forma acessível
      const totalProjects = screen.getByText('Total de Projetos');
      const totalValue = screen.getByText('10');

      expect(totalProjects).toBeInTheDocument();
      expect(totalValue).toBeInTheDocument();
    });
  });
});
