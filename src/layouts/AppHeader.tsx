import {
  ActionIcon,
  Avatar,
  Burger,
  Flex,
  Group,
  Input,
  useMantineColorScheme,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { Moon, Search, Sun } from "lucide-react"
import { useStore } from "../store/client/useStore"

interface AppHeaderProps {
  opened: boolean
  toggle: () => void
}

export default function AppHeader({ opened, toggle }: AppHeaderProps) {
  const { isNavbarCollapse, toggleNavbar } = useStore()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const smallScreen = useMediaQuery("(max-width: 48em)")

  return (
    <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
      <Flex align="center" gap="md">
        <Burger
          opened={smallScreen ? opened : isNavbarCollapse}
          onClick={smallScreen ? toggle : toggleNavbar}
          size="sm"
          aria-label="Toggle navigation"
        />
        <Input
          leftSection={<Search size={17} aria-hidden="true" />}
          placeholder="Buscar"
          w={{ base: 150, sm: 300 }}
          aria-label="Buscar"
        />
      </Flex>

      <Flex align="center" gap="sm">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={toggleColorScheme}
          aria-label="Toggle color scheme"
        >
          {colorScheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </ActionIcon>
        <Avatar radius="xl" color="indigo">
          JG
        </Avatar>
      </Flex>
    </Group>
  )
}
