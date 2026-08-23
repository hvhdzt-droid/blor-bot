require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");

const TOKEN = "MTU0MDExMDU3ODAwODMzNDMzNg.GuX8TQ.rt0jj0_O4b_SuCBB532QdFEBVj58KZiRM9dbZ0";
const CLIENT_ID = "1540110578008334336";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// التحذيرات
// =========================

const warnings = new Map();

// =========================
// الأوامر
// =========================

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
    .setName("userinfo")
    .setDescription("معلومات عن عضو")
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
    .setName("unban")
    .setDescription("فك حظر عضو")
    .addStringOption(o =>
      o.setName("userid")
        .setDescription("ID العضو")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("إعطاء عضو تايم أوت")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutes")
        .setDescription("المدة بالدقائق")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    ),

  new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("إزالة التايم أوت")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("تحذير عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason")
        .setDescription("سبب التحذير")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("عرض تحذيرات عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("قفل الروم"),

  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("فتح الروم"),

  new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("تفعيل Slowmode")
    .addIntegerOption(o =>
      o.setName("seconds")
        .setDescription("عدد الثواني")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    ),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("إرسال رسالة باسم البوت")
    .addStringOption(o =>
      o.setName("message")
        .setDescription("الرسالة")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("إرسال إعلان")
    .addStringOption(o =>
      o.setName("message")
        .setDescription("نص الإعلان")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("إنشاء تصويت")
    .addStringOption(o =>
      o.setName("question")
        .setDescription("السؤال")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("role")
    .setDescription("إعطاء رتبة لعضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("role")
        .setDescription("الرتبة")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("إزالة رتبة من عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("role")
        .setDescription("الرتبة")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("nick")
    .setDescription("تغيير لقب عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("nickname")
        .setDescription("اللقب الجديد")
        .setRequired(true)
    )
].map(command => command.toJSON());

// =========================
// تسجيل الأوامر
// =========================

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
    console.error("خطأ في تسجيل الأوامر:", error);
  }
})();

// =========================
// تشغيل البوت
// =========================

client.once("ready", () => {
  console.log(`تم تشغيل البوت: ${client.user.tag}`);

  client.user.setActivity("3KAF BOT", {
    type: 0
  });
});

// =========================
// الأوامر
// =========================

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  try {
    // نثبت الـ Interaction مباشرة حتى لا تنتهي مهلة Discord
    await interaction.deferReply();

    // =========================
    // PING
    // =========================

    if (command === "ping") {
      return await interaction.editReply(
        `🏓 Pong! السرعة: ${client.ws.ping}ms`
      );
    }

    // =========================
    // HELP
    // =========================

    if (command === "help") {
      const embed = new EmbedBuilder()
        .setTitle("🤖 أوامر 3KAF BOT")
        .setDescription(
          "**🛠️ أوامر عامة**\n" +
          "`/help` — قائمة الأوامر\n" +
          "`/ping` — سرعة البوت\n" +
          "`/server` — معلومات السيرفر\n" +
          "`/userinfo` — معلومات عضو\n" +
          "`/avatar` — صورة عضو\n\n" +

          "**🛡️ أوامر الإدارة**\n" +
          "`/clear` — حذف رسائل\n" +
          "`/kick` — طرد عضو\n" +
          "`/ban` — حظر عضو\n" +
          "`/unban` — فك الحظر\n" +
          "`/timeout` — تايم أوت\n" +
          "`/untimeout` — إزالة التايم أوت\n" +
          "`/warn` — تحذير عضو\n" +
          "`/warnings` — تحذيرات العضو\n\n" +

          "**🔒 أوامر الرومات**\n" +
          "`/lock` — قفل الروم\n" +
          "`/unlock` — فتح الروم\n" +
          "`/slowmode` — Slowmode\n\n" +

          "**🎭 أوامر الرتب**\n" +
          "`/role` — إعطاء رتبة\n" +
          "`/removerole` — إزالة رتبة\n" +
          "`/nick` — تغيير اللقب\n\n" +

          "**📢 أوامر الرسائل**\n" +
          "`/say` — إرسال رسالة\n" +
          "`/announce` — إعلان\n" +
          "`/poll` — تصويت"
        )
        .setFooter({ text: "3KAF BOT" });

      return await interaction.editReply({
        embeds: [embed]
      });
    }

    // =========================
    // SERVER
    // =========================

    if (command === "server") {
      const guild = interaction.guild;

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${guild.name}`)
        .addFields(
          {
            name: "👥 الأعضاء",
            value: `${guild.memberCount}`,
            inline: true
          },
          {
            name: "🆔 ID",
            value: guild.id,
            inline: true
          },
          {
            name: "👑 المالك",
            value: `<@${guild.ownerId}>`,
            inline: true
          }
        );

      return await interaction.editReply({
        embeds: [embed]
      });
    }

    // =========================
    // AVATAR
    // =========================

    if (command === "avatar") {
      const user =
        interaction.options.getUser("user") ||
        interaction.user;

      return await interaction.editReply({
        content: user.displayAvatarURL({
          extension: "png",
          size: 1024
        })
      });
    }

    // =========================
    // USERINFO
    // =========================

    if (command === "userinfo") {
      const user =
        interaction.options.getUser("user") ||
        interaction.user;

      const member =
        await interaction.guild.members.fetch(user.id);

      const embed = new EmbedBuilder()
        .setTitle(`👤 معلومات ${user.username}`)
        .setThumbnail(
          user.displayAvatarURL({
            extension: "png",
            size: 512
          })
        )
        .addFields(
          {
            name: "🆔 ID",
            value: user.id
          },
          {
            name: "📅 إنشاء الحساب",
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`
          },
          {
            name: "📥 دخول السيرفر",
            value: member.joinedTimestamp
              ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
              : "غير معروف"
          }
        );

      return await interaction.editReply({
        embeds: [embed]
      });
    }

    // =========================
    // CLEAR
    // =========================

    if (command === "clear") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageMessages
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية حذف الرسائل."
        );
      }

      const amount =
        interaction.options.getInteger("amount");

      await interaction.channel.bulkDelete(amount, true);

      return await interaction.editReply(
        `🧹 تم حذف ${amount} رسالة.`
      );
    }

    // =========================
    // KICK
    // =========================

    if (command === "kick") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.KickMembers
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية الطرد."
        );
      }

      const user =
        interaction.options.getUser("user");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.kickable) {
        return await interaction.editReply(
          "❌ ما أقدر أطرد هذا العضو."
        );
      }

      await member.kick();

      return await interaction.editReply(
        `👢 تم طرد **${user.tag}**`
      );
    }

    // =========================
    // BAN
    // =========================

    if (command === "ban") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.BanMembers
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية الحظر."
        );
      }

      const user =
        interaction.options.getUser("user");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.bannable) {
        return await interaction.editReply(
          "❌ ما أقدر أحظر هذا العضو."
        );
      }

      await member.ban();

      return await interaction.editReply(
        `🔨 تم حظر **${user.tag}**`
      );
    }

    // =========================
    // UNBAN
    // =========================

    if (command === "unban") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.BanMembers
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية فك الحظر."
        );
      }

      const userId =
        interaction.options.getString("userid");

      try {
        await interaction.guild.members.unban(userId);

        return await interaction.editReply(
          `✅ تم فك الحظر عن العضو صاحب ID: **${userId}**`
        );
      } catch {
        return await interaction.editReply(
          "❌ لم أجد عضوًا محظورًا بهذا الـ ID."
        );
      }
    }

    // =========================
    // TIMEOUT
    // =========================

    if (command === "timeout") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ModerateMembers
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية التايم أوت."
        );
      }

      const user =
        interaction.options.getUser("user");

      const minutes =
        interaction.options.getInteger("minutes");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.moderatable) {
        return await interaction.editReply(
          "❌ ما أقدر أعطي هذا العضو تايم أوت."
        );
      }

      await member.timeout(minutes * 60 * 1000);

      return await interaction.editReply(
        `⏳ تم إعطاء **${user.tag}** تايم أوت لمدة **${minutes} دقيقة**.`
      );
    }

    // =========================
    // UNTIMEOUT
    // =========================

    if (command === "untimeout") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ModerateMembers
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية إزالة التايم أوت."
        );
      }

      const user =
        interaction.options.getUser("user");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.moderatable) {
        return await interaction.editReply(
          "❌ ما أقدر أعدل على هذا العضو."
        );
      }

      await member.timeout(null);

      return await interaction.editReply(
        `✅ تم إزالة التايم أوت عن **${user.tag}**`
      );
    }

    // =========================
    // WARN
    // =========================

    if (command === "warn") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ModerateMembers
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية التحذير."
        );
      }

      const user =
        interaction.options.getUser("user");

      const reason =
        interaction.options.getString("reason") ||
        "بدون سبب";

      const key =
        `${interaction.guild.id}-${user.id}`;

      if (!warnings.has(key)) {
        warnings.set(key, []);
      }

      warnings.get(key).push({
        reason,
        moderator: interaction.user.tag,
        date: new Date()
      });

      const count =
        warnings.get(key).length;

      return await interaction.editReply(
        `⚠️ تم تحذير **${user.tag}**\nالسبب: **${reason}**\nعدد التحذيرات: **${count}**`
      );
    }

    // =========================
    // WARNINGS
    // =========================

    if (command === "warnings") {
      const user =
        interaction.options.getUser("user");

      const key =
        `${interaction.guild.id}-${user.id}`;

      const userWarnings =
        warnings.get(key) || [];

      if (userWarnings.length === 0) {
        return await interaction.editReply(
          `✅ **${user.tag}** ليس لديه تحذيرات.`
        );
      }

      const text =
        userWarnings
          .map(
            (w, i) =>
              `**${i + 1}.** ${w.reason} — بواسطة ${w.moderator}`
          )
          .join("\n");

      const embed = new EmbedBuilder()
        .setTitle(`⚠️ تحذيرات ${user.tag}`)
        .setDescription(text);

      return await interaction.editReply({
        embeds: [embed]
      });
    }

    // =========================
    // LOCK
    // =========================

    if (command === "lock") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageChannels
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية قفل الروم."
        );
      }

      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: false
        }
      );

      return await interaction.editReply(
        "🔒 تم قفل الروم."
      );
    }

    // =========================
    // UNLOCK
    // =========================

    if (command === "unlock") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageChannels
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية فتح الروم."
        );
      }

      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: null
        }
      );

      return await interaction.editReply(
        "🔓 تم فتح الروم."
      );
    }

    // =========================
    // SLOWMODE
    // =========================

    if (command === "slowmode") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageChannels
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية استخدام Slowmode."
        );
      }

      const seconds =
        interaction.options.getInteger("seconds");

      await interaction.channel.setRateLimitPerUser(
        seconds
      );

      if (seconds === 0) {
        return await interaction.editReply(
          "✅ تم إيقاف الـ Slowmode."
        );
      }

      return await interaction.editReply(
        `🐌 تم تفعيل Slowmode لمدة **${seconds} ثانية**.`
      );
    }

    // =========================
    // SAY
    // =========================

    if (command === "say") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageMessages
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية استخدام الأمر."
        );
      }

      const message =
        interaction.options.getString("message");

      await interaction.channel.send(message);

      return await interaction.editReply(
        "✅ تم الإرسال."
      );
    }

    // =========================
    // ANNOUNCE
    // =========================

    if (command === "announce") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageMessages
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية الإعلانات."
        );
      }

      const message =
        interaction.options.getString("message");

      const embed = new EmbedBuilder()
        .setTitle("📢 إعلان")
        .setDescription(message)
        .setFooter({
          text: `بواسطة ${interaction.user.tag}`
        })
        .setTimestamp();

      await interaction.channel.send({
        embeds: [embed]
      });

      return await interaction.editReply(
        "✅ تم إرسال الإعلان."
      );
    }

    // =========================
    // POLL
    // =========================

    if (command === "poll") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageMessages
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية إنشاء تصويت."
        );
      }

      const question =
        interaction.options.getString("question");

      const message =
        await interaction.channel.send(
          `📊 **تصويت**\n\n${question}\n\n👍 = نعم\n👎 = لا`
        );

      await message.react("👍");
      await message.react("👎");

      return await interaction.editReply(
        "✅ تم إنشاء التصويت."
      );
    }

    // =========================
    // ROLE
    // =========================

    if (command === "role") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageRoles
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية إدارة الرتب."
        );
      }

      const user =
        interaction.options.getUser("user");

      const role =
        interaction.options.getRole("role");

      const member =
        await interaction.guild.members.fetch(user.id);

      const botMember =
        interaction.guild.members.me;

      if (
        role.position >=
        interaction.member.roles.highest.position
      ) {
        return await interaction.editReply(
          "❌ ما تقدر تعطي رتبة أعلى من رتبتك."
        );
      }

      if (
        botMember &&
        role.position >= botMember.roles.highest.position
      ) {
        return await interaction.editReply(
          "❌ رتبة البوت أقل من هذه الرتبة."
        );
      }

      await member.roles.add(role);

      return await interaction.editReply(
        `✅ تم إعطاء ${role} إلى **${user.tag}**`
      );
    }

    // =========================
    // REMOVE ROLE
    // =========================

    if (command === "removerole") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageRoles
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية إدارة الرتب."
        );
      }

      const user =
        interaction.options.getUser("user");

      const role =
        interaction.options.getRole("role");

      const member =
        await interaction.guild.members.fetch(user.id);

      const botMember =
        interaction.guild.members.me;

      if (
        role.position >=
        interaction.member.roles.highest.position
      ) {
        return await interaction.editReply(
          "❌ ما تقدر تزيل رتبة أعلى من رتبتك."
        );
      }

      if (
        botMember &&
        role.position >= botMember.roles.highest.position
      ) {
        return await interaction.editReply(
          "❌ رتبة البوت أقل من هذه الرتبة."
        );
      }

      await member.roles.remove(role);

      return await interaction.editReply(
        `✅ تم إزالة ${role} من **${user.tag}**`
      );
    }

    // =========================
    // NICK
    // =========================

    if (command === "nick") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageNicknames
        )
      ) {
        return await interaction.editReply(
          "❌ ما عندك صلاحية تغيير الألقاب."
        );
      }

      const user =
        interaction.options.getUser("user");

      const nickname =
        interaction.options.getString("nickname");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.manageable) {
        return await interaction.editReply(
          "❌ ما أقدر أغير لقب هذا العضو."
        );
      }

      await member.setNickname(nickname);

      return await interaction.editReply(
        `✅ تم تغيير لقب **${user.tag}** إلى **${nickname}**`
      );
    }

  } catch (error) {
    console.error("حدث خطأ أثناء تنفيذ الأمر:", error);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          "❌ حدث خطأ أثناء تنفيذ الأمر."
        );
      }
    } catch (replyError) {
      console.error("تعذر إرسال رسالة الخطأ:", replyError);
    }
  }
});

// =========================
// أخطاء البوت
// =========================

client.on("error", error => {
  console.error("Discord Client Error:", error);
});

client.on("warn", warning => {
  console.warn("Discord Warning:", warning);
});

// =========================
// تسجيل الدخول
// =========================

client.login(TOKEN);
