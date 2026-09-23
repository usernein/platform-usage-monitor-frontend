import { Box, Group, HoverCard, RingProgress, Stack, Text, ThemeIcon } from "@mantine/core"
import { Activity, Target, TrendingUp } from "lucide-react"
import { getScoreColor } from "../utils/usage"

interface ScoreRingProps {
    score: number
    size?: number
    thickness?: number
    goalsMeeting?: number
    totalGoals?: number
    activeRate?: number
    trend?: number
}

export function ScoreRing({
    score,
    size = 112,
    thickness = 10,
    goalsMeeting,
    totalGoals,
    activeRate,
    trend,
}: ScoreRingProps) {
    return (
        <HoverCard width={285} shadow="md" position="bottom" openDelay={180} withinPortal>
            <HoverCard.Target>
                <Box display="inline-flex" style={{ cursor: "help" }}>
                    <RingProgress
                        size={size}
                        thickness={thickness}
                        roundCaps
                        sections={[{ value: score, color: getScoreColor(score) }]}
                        label={
                            <Text ta="center" fw={700} fz={size < 100 ? 18 : 24}>
                                {score}
                            </Text>
                        }
                        aria-label={`Score ${score} de 100. Passe o mouse para entender o cálculo.`}
                    />
                </Box>
            </HoverCard.Target>
            <HoverCard.Dropdown>
                <Stack gap="sm">
                    <div>
                        <Text fw={700} size="sm">
                            Por que este score é {score}?
                        </Text>
                        <Text size="xs" c="dimmed">
                            Panorama consolidado das metas de uso
                        </Text>
                    </div>
                    <Group gap="sm" wrap="nowrap">
                        <ThemeIcon color="indigo" variant="light" size="sm">
                            <Target size={14} />
                        </ThemeIcon>
                        <Text size="xs">
                            {goalsMeeting !== undefined && totalGoals
                                ? `${goalsMeeting} de ${totalGoals} metas estão no esperado`
                                : `${score}% de adesão consolidada às metas`}
                        </Text>
                    </Group>
                    <Group gap="sm" wrap="nowrap">
                        <ThemeIcon color="cyan" variant="light" size="sm">
                            <Activity size={14} />
                        </ThemeIcon>
                        <Text size="xs">
                            {activeRate !== undefined
                                ? `${activeRate}% dos usuários estão ativos`
                                : `${100 - score} pontos separam o resultado do ideal`}
                        </Text>
                    </Group>
                    <Group gap="sm" wrap="nowrap">
                        <ThemeIcon color={score >= 70 ? "teal" : "yellow"} variant="light" size="sm">
                            <TrendingUp size={14} />
                        </ThemeIcon>
                        <Text size="xs">
                            {trend !== undefined
                                ? `${trend >= 0 ? "+" : ""}${trend}% versus o período anterior`
                                : score >= 85
                                  ? "Situação saudável, com boa adesão geral"
                                  : score >= 70
                                    ? "Situação estável, com pontos para acompanhar"
                                    : "Adesão abaixo do esperado, requer atenção"}
                        </Text>
                    </Group>
                </Stack>
            </HoverCard.Dropdown>
        </HoverCard>
    )
}
