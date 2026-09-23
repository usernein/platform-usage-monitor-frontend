import { Link, useLocation } from "react-router-dom"
import { Button, Flex, Text, useMantineColorScheme } from "@mantine/core"
import { LogOut } from "lucide-react"
import useCurrentSubNav from "../hooks/useCurrentSubNav"
import classes from "./styles/SubNavBar.module.css"

interface Props {
    isNavbarOpen: boolean
    appTitle: string
}

export default function SubNavBar({ isNavbarOpen, appTitle }: Props) {
    const currentNav = useCurrentSubNav({ appTitle })

    const { pathname } = useLocation()

    const { colorScheme } = useMantineColorScheme()

    return (
        <Flex
            className={classes.root}
            data-collapsed={isNavbarOpen}
            h="100%"
            direction="column"
            align="start"
            w={217}
            py="sm"
            px="md"
        >
            <Text fz={20} fw={600}>
                {currentNav?.label}
            </Text>

            <Flex flex={1} gap={10} direction="column" align="start" my={30} w="100%">
                {currentNav?.subs?.map(({ href, icon: Icon, title }) => (
                    <Link
                        key={href}
                        preventScrollReset
                        className={classes.nav_link}
                        data-active={pathname === href}
                        to={href}
                    >
                        <Icon
                            size={20}
                            color={
                                colorScheme === "light" && pathname === href
                                    ? "white"
                                    : colorScheme === "dark" && pathname === href
                                        ? "black"
                                        : "gray"
                            }
                        />
                        <Text fz={14}>{title}</Text>
                    </Link>
                ))}
            </Flex>

            <Flex
                pos="absolute"
                bottom={0}
                left={0}
                p={10}
                bg={
                    colorScheme === "light"
                        ? "var(--mantine-color-gray-0)"
                        : "var(--mantine-color-gray-8)"
                }
                w="100%"
                justify="space-between"
                align="center"
            >
                <Flex direction="column" align="start">
                    <Text fz={14} fw={600}>
                        João Gomes
                    </Text>
                    <Text fz={12}>joao.gomes@edu.br</Text>
                </Flex>
                <Button
                    m={0}
                    p={8}
                    color={
                        colorScheme === "light" ? "black" : "var(--mantine-color-gray-7)"
                    }
                >
                    <LogOut size={20} />
                </Button>
            </Flex>
        </Flex>
    )
}
