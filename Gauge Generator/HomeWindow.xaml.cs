using Microsoft.Win32;
using System;
using System.Collections.Generic;
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
        public HomeWindow()
        {
            InitializeComponent();
        }

        private void NewButton(object sender, RoutedEventArgs e)
        {
            ((MainWindow)Owner).LoadData("", false);
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
                ((MainWindow)Owner).LoadData(opn.FileName, false);
                DialogResult = true;
            }
        }

        private void TutorialsButton(object sender, RoutedEventArgs e)
        {
            System.Diagnostics.Process.Start("https://adan2013.github.io/Gauge-Generator/examples/");
        }

        private void RecentClick(object sender, RoutedEventArgs e)
        {

        }
    }
}
