using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for HomeWindow.xaml
    /// </summary>
    public partial class HomeWindow : Window
    {

        string[] examplepath =
        {
            "Gauge_Generator.Examples.example1.ggp",
            "Gauge_Generator.Examples.example2.ggp",
            "Gauge_Generator.Examples.example3.ggp",
            "Gauge_Generator.Examples.example4.ggp",
            "Gauge_Generator.Examples.example5.ggp",
            "Gauge_Generator.Examples.example6.ggp"
        };

        public HomeWindow()
        {
            InitializeComponent();
            LoadRecentProjects();
        }

        private void NewButton(object sender, RoutedEventArgs e)
        {
            Global.LoadProject("", false);
            DialogResult = true;
        }

        private void OpenButton(object sender, RoutedEventArgs e)
        {
            OpenFileDialog opn = new OpenFileDialog
            {
                Multiselect = false,
                Filter = "Gauge Generator Project (*.ggp)|*.ggp"
            };
            if ((bool)opn.ShowDialog())
            {
                Global.LoadProject(opn.FileName, false);
                DialogResult = true;
            }
        }

        private void TutorialsButton(object sender, RoutedEventArgs e)
        {
            System.Diagnostics.Process.Start("https://adan2013.github.io/Gauge-Generator/examples/");
        }
        
        private void LoadRecentProjects()
        {
            recent0.Content = "Empty slot";
            recent1.Content = "Empty slot";
            recent2.Content = "Empty slot";
            recent3.Content = "Empty slot";
            List<string> l = Global.rp_container.GetItems();
            if (l.Count > 0) recent0.Content = new System.IO.FileInfo(l[0]).Name;
            if (l.Count > 1) recent1.Content = new System.IO.FileInfo(l[1]).Name;
            if (l.Count > 2) recent2.Content = new System.IO.FileInfo(l[2]).Name;
            if (l.Count > 3) recent3.Content = new System.IO.FileInfo(l[3]).Name;
        }

        private void RecentClick(object sender, RoutedEventArgs e)
        {
            int number = Convert.ToInt32(((Button)sender).Tag);
            List<string> l = Global.rp_container.GetItems();
            if (number < l.Count)
            {
                if (File.Exists(l[number]))
                {
                    Global.LoadProject(l[number], false);
                    DialogResult = true;
                }
                else
                {
                    MessageBox.Show("Project file not found! The position will be deleted", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    Global.rp_container.DeleteItem(number);
                    Global.rp.CheckChanges();
                    Global.rp.SaveChanges();
                    LoadRecentProjects();
                }
            }
        }

        private void OpenExample(object sender, RoutedEventArgs e)
        {
            int number = Convert.ToInt32(((Button)sender).Tag);
            string file = Environment.GetFolderPath(Environment.SpecialFolder.Templates) + "\\gg_exaple.ggp";
            try
            {
                Stream stream = System.Reflection.Assembly.GetExecutingAssembly().GetManifestResourceStream(examplepath[number]);
                FileStream fileStream = new FileStream(file, FileMode.Create);
                for (int i = 0; i < stream.Length; i++) fileStream.WriteByte((byte)stream.ReadByte());
                fileStream.Close();
                Global.LoadProject(file, true);
                DialogResult = true;
            }
            catch { MessageBox.Show("Example file error", "Error", MessageBoxButton.OK, MessageBoxImage.Exclamation); }
        }
    }
}
