import { RingProgress, Text } from "@mantine/core"
import { getScoreColor } from "../utils/usage"

interface ScoreRingProps {
    score: number
    size?: number
    thickness?: number
}

export function ScoreRing({ score, size = 112, thickness = 10 }: ScoreRingProps) {
    return (
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
            aria-label={`Score ${score} de 100`}
        />
    )
}
