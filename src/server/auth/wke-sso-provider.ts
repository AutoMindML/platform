import axios from "axios";

import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

import { env } from "@/env.mjs";

export interface WKESSOProfile extends Record<string, unknown> {
  data: {
    mid: number;
    account: string;
    nickName: string;
    gName: string;
  };
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

// * reference document : https://sso.wke.csie.ncnu.edu.tw/document
export default function WKESSOProvider<P extends WKESSOProfile>(
  options: OAuthUserConfig<P>,
): OAuthConfig<P> {
  const { clientId } = options;
  const baseUrl = "https://sso.wke.csie.ncnu.edu.tw";
  const redirectURL = env.WKESSO_CALLBACK_URL;
  const redirectURI = encodeURI(redirectURL);

  if (!clientId) throw new Error("clientId is required");

  //https://sso.wke.csie.ncnu.edu.tw/loginpage?client_id={client_id}&redirecturi={redirecturi}&state={state-param}
  //redirecturi 須經過 encodeURI 處理

  return {
    id: "wkesso",
    name: "WKESSO",
    type: "oauth",
    authorization: {
      url: `${baseUrl}/loginpage`,
      params: {
        client_id: clientId,
        redirecturi: redirectURI,
      },
    },

    /**
     * * 利用 code 或者 refresh_token 取得 access_token
      Client 用 HTTP Basic Auth 來認證（見 RFC 2617）。帳密要先用 urlencode 編過。

      例如 Client ID 是 s6BhdRkqt3 、 Client Secret 是 7Fjfp0ZBr1KtDRbnfVdmIw ，則步驟如下：

    * ! Step 1: 根據 Basic Auth 的規則，把 ID 和 Secret 連起來，中間用冒號 : 分開，變成這樣：

      s6BhdRkqt3:7Fjfp0ZBr1KtDRbnfVdmIw

    * ! Step 2: 用 base64 編過，變成這樣：

      czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3

    * ! Step 3: 加上 Basic 前綴：

      Basic czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3

    * ! Step 4: 最後得到的 HTTP Auth 的 header 就是：

      Authorization: Basic czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3
     */

    /**
     * * code 取得 access_token 範例：

      POST /token HTTP/1.1
      Host: server.example.com
      Authorization: Basic czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3
      Content-Type: application/json;charset=UTF-8

      {
          grant_type: "authorization_code",
          code: "132546789",
          redirecturi: "http://domain/callback"
      }
     */

    /**
     * * refresh_token 取得 access_token 範例：

      POST /token HTTP/1.1
      Host: server.example.com
      Authorization: Basic czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3
      Content-Type: application/json;charset=UTF-8

      {
          grant_type: "refresh_token",
          refresh_token: "132546789987654321"
      }
     */

    /**
     * * 若 Access Token Request 合法且有經過授權，則核發 Access Token。如果 Client 認證失敗，或 Request 不合法，則回覆錯誤。

      回傳範例：

      HTTP/1.1 200 OK
      Content-Type: application/json;charset=UTF-8
      Cache-Control: no-store
      Pragma: no-cache

      {
        "access_token":"2YotnFZFEjr1zCsicMWpAA",
        "expires_in":3600,
        "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA"
      }
     */

    token: {
      request: async (ctx) => {
        const url = `${baseUrl}/api/Client/token`;
        const code = ctx.params.code;
        const { clientId, clientSecret } = ctx.provider;

        if (!clientId || !clientSecret) {
          return { tokens: {} };
        }

        // ! step 1 + step 2
        const basic = Buffer.from(clientId + ":" + clientSecret).toString(
          "base64",
        );

        const payload = {
          grant_type: "authorization_code",
          code: code,
          redirecturi: redirectURI,
        };

        // ! use code get access_token
        const res = await axios.post<TokenResponse>(url, payload, {
          // ! step 4
          headers: {
            // ! step 3
            Authorization: `Basic ${basic}`,
          },
        });
        const { access_token, refresh_token, expires_in } = res.data;
        return {
          tokens: {
            token_type: "Bearer",
            scope: "email identity",
            access_token,
            refresh_token,
            expires_at: expires_in,
          },
        };
      },
    },

    /**
     * * Client 向 Resource Server 出示 Access Token 取得使用者資訊
      範例：

      GET /resource HTTP/1.1
      Host: server.example.com
      Authorization: Bearer mF_9.B5f-4.1JqM
     */

    userinfo: {
      request: async (ctx) => {
        const access_token = ctx.tokens.access_token;
        if (!access_token) {
          return {};
        }

        type ResourceResponse = {
          mid: number;
          account: string;
          nickname: string;
        };
        const url = `${baseUrl}/api/Member/resource`;

        // ! Headers 中的 Authorization 為："Bearer " + access_token;
        const bearerToken = "Bearer " + access_token;

        // ! return user data if access_token is correct
        const res = await axios.get<ResourceResponse>(url, {
          headers: {
            Authorization: bearerToken,
          },
        });
        return res.data;
      },
    },
    profile: (profile) => {
      return {
        id: profile.data.mid.toString(),
        name: profile.data.nickName,
        email: profile.data.account,
      };
    },
    style: {
      logo: "",
      logoDark: "/assets/icons/wkesso.ico",
      bg: "#101010",
      bgDark: "rgb(148 163 184)",
      text: "#ffffff",
      textDark: "#ffffff",
    },
    options,
  };
}
