/*
MIT License
Copyright (c) 2022 John Damilola, Leo Hsiang, Swarangi Gaurkar, Kritika Javali, Aaron Dias Barreto
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import ShortUrlRedirectionPage from "screens/ErrorScreens/ShortUrlRedirectionPage";
import Swal from "sweetalert2";
import http from '../../utils/api';
import "./styles.scss";

const RedirectionPage = () => {
  const { pathname } = useLocation()
  const params = useParams() || {}
  const stub = params?.stub || params['*']

  let dateTime = new Date();
  const [endpoint1Called, setEndpoint1Called] = useState(false)
  const [endpoint2Called, setEndpoint2Called] = useState(false)

  const [errorPage, setErrorPage] = useState<boolean>(false);


  useEffect(() => {
    if (!endpoint1Called) {
      fetchURL()
    }
  }, [])

  const updateLinkEngagement = async (link_id: any, utm_source: any, utm_medium: any, utm_campaign: any, utm_term: any, utm_content: any) => {
		if (!endpoint2Called) {
      await http
			.post(`http://localhost:5002/links/engagements/${link_id}/create`, {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content
      }).then(() => setEndpoint2Called(true))
    }
	};

  const fetchURL = async () => {
    const url = pathname.startsWith('/a/') ? `http://localhost:5002/${stub}` : `http://localhost:5002/${stub}`
		await http
			.get(url)
			.then(async(res) => {
        setEndpoint1Called(true)
        const { link } = res.data || {};
        const { id: link_id, disabled, expire_on, long_url, password_hash, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = link || {}
        if (pathname.startsWith('/a/')) {
          return window.location.assign(long_url);
        }
				const isExpired = (expire_on && new Date(expire_on) > dateTime) || false;
				if (disabled == false && !password_hash && !isExpired) {
          if (!endpoint2Called) {
            await updateLinkEngagement(link_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content)
          }
					return window.location.assign(long_url);
				}
				else if (disabled == true || isExpired) {
					Swal.fire({
            icon: 'error',
            title: 'Oops, this link is no longer active!',
            text: 'It has either expired or has been disabled by the owner',
            confirmButtonColor: '#221daf',
          })
				}
				else if (password_hash) {
					Swal.fire({
						title: 'Enter password for authetication',
						input: 'text',
						inputAttributes: {
							autocapitalize: 'off',
						},
						showCancelButton: true,
						confirmButtonText: 'Submit',
						showLoaderOnConfirm: true,
						preConfirm: (password) => {
							if (password == link.password_hash) {
								window.location.assign(link.long_url);
							} else {
								Swal.showValidationMessage(`Incorect password. Request failed!`);
							}
						},
					});
				}
			})
			.catch((err) => {
        setErrorPage(true)
        // errorPage = <ShortUrlRedirectionPage />
			});
	};

  console.log(endpoint1Called, endpoint2Called)

  if (errorPage) {
    return <ShortUrlRedirectionPage />
  }
  return <div></div>;
};

export default RedirectionPage;