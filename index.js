const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("عرض جميع أوامر البوت"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("معرفة سرعة البوت"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("معلومات السيرفر"),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("عرض صورة العضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("حذف رسائل")
    .addIntegerOption(o =>
      o.setName("amount")
        .setDescription("عدد الرسائل")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("طرد عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("حظر عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("إرسال رسالة باسم البوت")
    .addStringOption(o =>
      o.setName("message")
        .setDescription("الرسالة")
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("جاري تسجيل الأوامر...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("تم تسجيل الأوامر بنجاح!");
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log(`تم تشغيل البوت: ${client.user.tag}`);
  client.user.setActivity("3KAF BOT", {
    type: 0
  });
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  if (command === "ping") {
    return interaction.reply(`🏓 Pong! السرعة: ${client.ws.ping}ms`);
  }

  if (command === "help") {
    const embed = new EmbedBuilder()
      .setTitle("🤖 أوامر البوت")
      .setDescription(
        "`/help` — قائمة الأوامر\n" +
        "`/ping` — سرعة البوت\n" +
        "`/server` — معلومات السيرفر\n" +
        "`/avatar` — صورة عضو\n" +
        "`/clear` — حذف رسائل\n" +
        "`/kick` — طرد عضو\n" +
        "`/ban` — حظر عضو\n" +
        "`/say` — إرسال رسالة"
      )
      .setFooter({ text: "3KAF BOT" });

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "server") {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${guild.name}`)
      .addFields(
        { name: "👥 الأعضاء", value: `${guild.memberCount}`, inline: true },
        { name: "🆔 ID", value: guild.id, inline: true }
      );

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "avatar") {
    const user =
      interaction.options.getUser("user") || interaction.user;

    return interaction.reply({
      content: user.displayAvatarURL({
        extension: "png",
        size: 1024
      })
    });
  }

  if (command === "clear") {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    ) {
      return interaction.reply({
        content: "❌ ما عندك صلاحية حذف الرسائل.",
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger("amount");

    await interaction.channel.bulkDelete(amount, true);

    return interaction.reply({
      content: `🧹 تم حذف ${amount} رسالة.`,
      ephemeral: true
    });
  }

  if (command === "kick") {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.KickMembers
      )
    ) {
      return interaction.reply({
        content: "❌ ما عندك صلاحية الطرد.",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);

    if (!member.kickable) {
      return interaction.reply({
        content: "❌ ما أقدر أطرد هذا العضو.",
        ephemeral: true
      });
    }

    await member.kick();

    return interaction.reply(`👢 تم طرد **${user.tag}**`);
  }

  if (command === "ban") {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.BanMembers
      )
    ) {
      return interaction.reply({
        content: "❌ ما عندك صلاحية الحظر.",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("user");

    await interaction.guild.members.ban(user.id);

    return interaction.reply(`🔨 تم حظر **${user.tag}**`);
  }

  if (command === "say") {
    const message = interaction.options.getString("message");

    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    ) {
      return interaction.reply({
        content: "❌ ما عندك صلاحية استخدام الأمر.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content: "✅ تم الإرسال.",
      ephemeral: true
    });

    await interaction.channel.send(message);
  }
});

client.login(TOKEN);
