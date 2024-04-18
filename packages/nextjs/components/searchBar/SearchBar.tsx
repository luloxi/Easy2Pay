import React, { useState } from "react";
import { Box, Button, Checkbox, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { SearchBarProps } from "~~/types/Easy2PayTypes";
import { notification } from "~~/utils/scaffold-eth";

export const SearchBar: React.FC<SearchBarProps> = ({ searchFilters, updateSearchFilters, updateSearchInput }) => {
  const [input, setInput] = useState<string>("");

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const isNumberOrHex = /^(0x)?[0-9a-f]+$/i.test(input) || !isNaN(Number(input));

    if (input === "" || isNumberOrHex) {
      updateSearchInput(input);
    } else {
      notification.error("Check your input for correctness");
    }
  };

  const handleReset = () => {
    setInput("");
    updateSearchInput("");
    // updateSearchFilters(0); // Reset filters to default
  };

  return (
    <Box width={"85%"}>
      <form onSubmit={handleSearch} className="flex items-center justify-center mb-5 space-x-3 mx-5">
        <Flex width={"50%"} gap={3}>
          <Input
            type="text"
            value={input}
            placeholder="Search by requestId or address"
            onChange={e => setInput(e.target.value)}
            padding={4}
            variant="flushed"
            focusBorderColor="#00FF00"
            _placeholder={{ opacity: 0.5, color: "gray.100" }}
          />
          <Button
            type="submit"
            variant="solid"
            // backgroundColor={"green"}
            padding={4}
            paddingX={6}
            borderRadius={4}
            textColor={"white"}
            colorScheme="green"
          >
            Search
          </Button>
          <Button
            type="button"
            variant="solid"
            backgroundColor={"red"}
            colorScheme="red"
            padding={4}
            paddingX={6}
            borderRadius={4}
            textColor={"white"}
            onClick={handleReset}
          >
            Reset
          </Button>
        </Flex>
      </form>
      <Stack spacing={[1, 5]} direction="row" justifyContent={"center"}>
        {searchFilters.map((filter, index) => (
          <Checkbox
            colorScheme="green"
            key={index}
            onChange={() => updateSearchFilters(index)}
            defaultChecked={filter?.selected}
          >
            <Text marginTop={0} color="#0BB847" as="i">
              {" "}
              {filter?.label}
            </Text>
          </Checkbox>
        ))}
      </Stack>
      <br />
    </Box>
  );
};
