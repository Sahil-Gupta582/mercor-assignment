require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  organization: "org-qKitGzrMeKW72faoJe1mSlPU",
  apiKey: process.env.OPEN_API_KEY,
});

const getAnswer = async (req, res) => {
  try {
    const openai = new OpenAIApi(configuration);
    const { text } = req.body;
    const result = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    return res.status(200).send({ answer: result.data.choices[0].message });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getAnswer,
};
