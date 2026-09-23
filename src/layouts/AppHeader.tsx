import {
  ActionIcon,
  Avatar,
  Button,
  Divider,
  Flex,
  Group,
  Input,
  Popover,
  Stack,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core"
import { LogOut, Moon, Search, Sun } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {Title} from "@mantine/core";

export default function AppHeader() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const navigate = useNavigate()

  return (
    <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
      <Flex align="center" gap="md">
        <Title size={"h3"}>
          Monitoramento de acessos
        </Title>
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
        <Popover width={240} position="bottom-end" shadow="md" withArrow>
          <Popover.Target>
            <UnstyledButton aria-label="Abrir menu de João Gomes">
              <Avatar radius="xl" color="indigo">
                JG
              </Avatar>
            </UnstyledButton>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap="sm">
              <div>
                <Text fw={600} size="sm">
                  João Gomes
                </Text>
                <Text c="dimmed" size="xs">
                  joao.gomes@educacao.com.br
                </Text>
              </div>
              <Divider />
              <Button
                variant="subtle"
                color="red"
                justify="flex-start"
                leftSection={<LogOut size={17} />}
                onClick={() => navigate("/")}
              >
                Sair
              </Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      </Flex>
    </Group>
  )
}
