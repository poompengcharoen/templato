import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import fs from "fs";
import inquirer from "inquirer";

const main = async () => {
  try {
    clear();

    console.log(
      chalk.cyan(
        figlet.textSync("Templato", {
          horizontalLayout: "full",
        })
      )
    );

    console.log(chalk.yellow("A simple template to files generator."));

    const initialQuestions = [
      {
        name: "inputPath",
        type: "input",
        message: "Enter the template path:",
        default: "/path/to/input.txt",
        validate: (value: string) =>
          !value.length ? "Please provide a path to the template file." : true,
      },
      {
        name: "outputName",
        type: "input",
        message: "Enter the output file name:",
        default: "file-[TEMPLATO.index].txt",
        validate: (value: string) =>
          !value.length ? "Please provide an output file name." : true,
      },
      {
        name: "copies",
        type: "number",
        message: "How many copies?",
        default: "100",
        validate: (value: number) => value !== 0,
      },
      {
        name: "outputPath",
        type: "input",
        message: "Enter the output path:",
        default: "/path/to/output-folder",
        validate: (value: string) =>
          !value.length ? "Please provide a path to the output folder." : true,
      },
    ];

    const initialAnswers = await inquirer.prompt(initialQuestions);
    const { inputPath, outputName, copies, outputPath } = initialAnswers;
    const formatPath = (path: string) => path.replace(/'/g, "").trim();
    const template = fs.readFileSync(formatPath(inputPath), "utf8");
    const pattern = /\[TEMPLATO.(.*?)\]/g;
    const matches = template.match(pattern);
    const tokens = matches
      ?.map((match) => {
        const token = match
          .trim()
          .replace("[", "")
          .replace("]", "")
          .replace("TEMPLATO.", "");

        return token;
      })
      .filter((token) => token !== "index");
    const tokensQuestions =
      tokens?.map((token) => {
        return {
          name: token,
          type: "input",
          message: `What is the value of "${token}"?`,
          validate: (value: string) =>
            !value.length ? `Please provide a value for "${token}".` : true,
        };
      }) || [];
    const tokensAnswers = await inquirer.prompt(tokensQuestions);
    const replacements = tokens?.map((token) => {
      return {
        token: `[TEMPLATO.${token}]`,
        value: tokensAnswers[token],
      };
    });
    const subtituteReplacements = (
      text: string,
      replacements: [{ token: string; value: string }] | any
    ) => {
      let newText = text;

      if (replacements && replacements.length) {
        replacements.forEach(
          (replacement: { token: string; value: string }) => {
            newText = newText.replace(replacement.token, replacement.value);
          }
        );
      }

      return newText;
    };
    const finalTemplate = subtituteReplacements(template, replacements);

    for (let i = 0; i <= copies - 1; i++) {
      const indexLength = i.toString().length;
      const lengthDiff = copies.toString().length - indexLength;
      const newIndex = lengthDiff <= 0 ? i : "0".repeat(lengthDiff) + i;
      const newFilePath = `${formatPath(outputPath)}/${outputName.replace(
        "[TEMPLATO.index]",
        newIndex.toString()
      )}`;
      const newFileContent = finalTemplate.replace(
        "[TEMPLATO.index]",
        newIndex.toString()
      );
      fs.writeFile(newFilePath, newFileContent, (error) => {
        if (error) {
          console.error(error);
        }
      });
    }

    console.log(chalk.green("Done!"));
  } catch (error) {
    console.error(error);
  }
};

main();
